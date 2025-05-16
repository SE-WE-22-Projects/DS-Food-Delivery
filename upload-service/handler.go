package uploadservice

import (
	"io"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/spf13/afero"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

const maxImageFileSize = 1024 * 1024 * 5

// HandleGetFile handles serving a file.
// The file is sent from disk if it is available, otherwise it is fetched and cached from S3.
func (s *Server) HandleGetFile(public bool) fiber.Handler {
	return func(c fiber.Ctx) error {
		// get sub-directory and file name
		dirId := sanitizeFilename(c.Params("directory"))
		fileId := sanitizeFilename(c.Params("fileId"))
		if len(dirId) == 0 || len(fileId) == 0 || len(dirId) > 48 || len(fileId) > 48 {
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Invalid file path"})
		}

		// get directory
		var directory = "public"
		if !public {
			directory = "user"
		}

		filePath := filepath.Join(directory, dirId, fileId)

		// open the file for reading
		f, err := s.openCachedFile(filePath, false)
		if err != nil {
			if os.IsNotExist(err) {
				return c.Status(404).JSON(dto.ErrorResponse{Ok: false, Error: "File does not exist"})
			}

			zap.L().Error("Cannot access file", zap.Error(err))
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Cannot access file"})
		}

		// get mimetype of the file and add it to response header
		mime, err := mimetype.DetectReader(f)
		if err != nil {
			zap.L().Error("Failed to get mimetype", zap.Error(err))
			return c.Status(500).JSON(dto.ErrorResponse{Ok: false, Error: "Failed to detect file type"})
		}
		c.Response().Header.Add("Content-type", mime.String())

		_, err = f.Seek(0, io.SeekStart)
		if err != nil {
			zap.L().Error("Failed to seek to start", zap.Error(err))
			return c.Status(500).JSON(dto.ErrorResponse{Ok: false, Error: "Failed to seek to start of file"})
		}

		// send file
		err = c.SendStream(f)
		if err != nil {
			zap.L().Error("Failed to send file", zap.Error(err))
			return c.Status(500).JSON(dto.ErrorResponse{Ok: false, Error: "Failed to send file"})
		}

		return nil
	}
}

// openCachedFile attempts to get the file from disk.
// If the file does not exist, it tries to get the file from S3 and retries.
func (s *Server) openCachedFile(path string, isRetry bool) (afero.File, error) {
	f, err := s.fs.Open(path)
	if err == nil {
		return f, nil
	}

	if isRetry || !os.IsNotExist(err) {
		return nil, err
	}

	err = s.S3Download(path)
	if err != nil {
		return nil, err
	}

	return s.openCachedFile(path, true)
}

func (s *Server) HandleUploadFile(public bool) fiber.Handler {
	return func(c fiber.Ctx) error {
		img, err := c.FormFile("file")
		if err != nil {
			zap.L().Error("Unable to get image", zap.Error(err))
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "file is missing"})
		}

		if img.Size > maxImageFileSize {
			zap.L().Error("User tried to upload an image larger than maxImageFileSize")
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "file is too large"})
		}

		token := middleware.GetUser(c)
		if token == nil {
			zap.L().Error("Failed to get user id", zap.Error(err))
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "failed to get user id"})
		}

		// get upload directory
		var directory string
		if public {
			directory = filepath.Join("public", time.Now().Format("20060201"))
		} else {
			directory = filepath.Join("user", token.UserId)
		}

		// create a random filename from an uuid
		fileId, err := uuid.NewRandom()
		if err != nil {
			zap.L().Error("Failed to generate file id", zap.Error(err))
			return fiber.ErrInternalServerError
		}
		filename := fileId.String()

		// file upload path
		uploadedPath := filepath.Join(directory, filename)

		fileData, err := img.Open()
		if err != nil {
			zap.L().Error("Unable to get image", zap.Error(err))
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "failed to read image"})
		}

		if err = s.fs.MkdirAll(directory, os.ModePerm); err != nil {
			zap.L().Error("Unable to create upload directory", zap.Error(err))
			return fiber.ErrInternalServerError
		}

		// upload the file to local cache
		{
			f, err := s.fs.Create(uploadedPath)
			if err != nil {
				zap.L().Error("Unable to create upload image", zap.Error(err))
				return fiber.ErrInternalServerError
			}
			if _, err = io.Copy(f, fileData); err != nil {
				zap.L().Error("Unable write image", zap.Error(err))
				return fiber.ErrInternalServerError
			}
			err = f.Close()
			if err != nil {
				zap.L().Error("Failed to upload file", zap.Error(err))
			}
		}

		// upload the file to s3
		{
			_, err = fileData.Seek(0, io.SeekStart)
			if err != nil {
				zap.L().Error("Failed to seek file", zap.Error(err))
				return fiber.ErrInternalServerError
			}
			err = s.S3Upload(filename, fileData)
			if err != nil {
				zap.L().Error("Failed to upload file to s3", zap.Error(err))
				return fiber.ErrInternalServerError
			}

		}

		// get url for file
		url := path.Join(s.cfg.Upload.Prefix, "uploads", filepath.ToSlash(uploadedPath))

		return c.JSON(dto.Response{Ok: true, Data: fiber.Map{"url": url}})
	}
}
