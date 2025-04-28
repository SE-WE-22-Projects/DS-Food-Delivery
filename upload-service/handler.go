package uploadservice

import (
	"io"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/gabriel-vasile/mimetype"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/spf13/afero"
	"go.uber.org/zap"
)

const maxImageFileSize = 1024 * 1024 * 5

func sendFile(fs afero.Fs, public bool) fiber.Handler {
	return func(c fiber.Ctx) error {
		dirId := sanitizeFilename(c.Params("directory"))
		fileId := sanitizeFilename(c.Params("fileId"))
		if len(dirId) == 0 || len(fileId) == 0 || len(dirId) > 48 || len(fileId) > 48 {
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Invalid file path"})
		}

		var directory = "public"
		if !public {
			directory = "user"
		}

		// check if the file exists and is accessible
		filePath := filepath.Join(directory, dirId, fileId)
		_, err := fs.Stat(filePath)
		if err != nil {
			if os.IsNotExist(err) {
				return c.Status(404).JSON(dto.ErrorResponse{Ok: false, Error: "File does not exist"})
			}

			zap.L().Error("Cannot access file", zap.Error(err))
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Cannot access file"})
		}

		f, err := fs.Open(filePath)
		if err != nil {
			if os.IsNotExist(err) {
				return c.Status(404).JSON(dto.ErrorResponse{Ok: false, Error: "File does not exist"})
			}

			zap.L().Error("Cannot access file", zap.Error(err))
			return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Cannot access file"})
		}

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

		err = c.SendStream(f)
		if err != nil {
			zap.L().Error("Failed to send file", zap.Error(err))
			return c.Status(500).JSON(dto.ErrorResponse{Ok: false, Error: "Failed to send file"})
		}

		return nil
	}
}

func uploadFile(fs afero.Fs, prefix string, public bool) fiber.Handler {
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
			c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "failed to read image"})
		}

		if err = fs.MkdirAll(directory, os.ModePerm); err != nil {
			zap.L().Error("Unable to create upload directory", zap.Error(err))
			return fiber.ErrInternalServerError
		}

		// upload the file
		f, err := fs.Create(uploadedPath)
		if err != nil {
			zap.L().Error("Unable to create upload image", zap.Error(err))
			return fiber.ErrInternalServerError
		}
		if _, err = io.Copy(f, fileData); err != nil {
			zap.L().Error("Unable write image", zap.Error(err))
			return fiber.ErrInternalServerError
		}

		// get url for file
		url := path.Join(prefix, "uploads", filepath.ToSlash(uploadedPath))

		return c.JSON(dto.Response{Ok: true, Data: fiber.Map{"url": url}})
	}
}
