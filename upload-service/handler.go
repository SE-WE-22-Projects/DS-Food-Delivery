package uploadservice

import (
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

const maxImageFileSize = 1024 * 1024 * 5

// Response is the format for a successful response.
type Response struct {
	Ok   bool `json:"ok"`
	Data any  `json:"data"`
}

// Response is the format for a response that indicates that an error occurred while processing the request
type ErrorResponse struct {
	Ok     bool   `json:"ok"`
	Error  string `json:"error"`
	Reason any    `json:"reason,omitempty"`
}

func sendFile(basePath string, public bool) fiber.Handler {
	return func(c fiber.Ctx) error {
		dirId := sanitizeFilename(c.Params("directory"))
		fileId := sanitizeFilename(c.Params("fileId"))
		if len(dirId) == 0 || len(fileId) == 0 || len(dirId) > 48 || len(fileId) > 48 {
			return c.Status(400).JSON(ErrorResponse{Ok: false, Error: "Invalid file path"})
		}

		var directory = "public"
		if !public {
			directory = "user"
		}

		// check if the file exists and is accessible
		filePath := filepath.Join(basePath, directory, dirId, fileId)
		_, err := os.Stat(filePath)
		if err != nil {
			if os.IsNotExist(err) {
				return c.Status(404).JSON(ErrorResponse{Ok: false, Error: "File does not exist"})
			}

			zap.L().Error("Cannot access file", zap.Error(err))
			return c.Status(400).JSON(ErrorResponse{Ok: false, Error: "Cannot access file"})
		}

		err = c.SendFile(filePath)
		if err != nil {
			zap.L().Error("Failed to send file", zap.Error(err))
			return c.Status(500).JSON(ErrorResponse{Ok: false, Error: "Failed to send file"})
		}

		return nil
	}
}

func uploadFile(basePath string, prefix string, public bool) fiber.Handler {
	return func(c fiber.Ctx) error {
		img, err := c.FormFile("file")
		if err != nil {
			zap.L().Error("Unable to get image", zap.Error(err))
			return c.Status(400).JSON(ErrorResponse{Ok: false, Error: "file is missing"})
		}

		if img.Size > maxImageFileSize {
			zap.L().Error("User tried to upload an image larger than maxImageFileSize")
			return c.Status(400).JSON(ErrorResponse{Ok: false, Error: "file is too large"})
		}

		token := middleware.GetUser(c)
		if token == nil {
			zap.L().Error("Failed to get user id", zap.Error(err))
			return c.Status(400).JSON(ErrorResponse{Ok: false, Error: "failed to get user id"})
		}

		// get upload directory
		var directory string
		if public {
			directory = filepath.Join(basePath, "public", time.Now().Format("20060201"))
		} else {
			directory = filepath.Join(basePath, "user", token.UserId)
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
			c.Status(400).JSON(ErrorResponse{Ok: false, Error: "failed to read image"})
		}

		if err = os.MkdirAll(directory, os.ModePerm); err != nil {
			zap.L().Error("Unable to create upload directory", zap.Error(err))
			return fiber.ErrInternalServerError
		}

		// upload the file
		f, err := os.Create(uploadedPath)
		if err != nil {
			zap.L().Error("Unable to create upload image", zap.Error(err))
			return fiber.ErrInternalServerError
		}
		if _, err = io.Copy(f, fileData); err != nil {
			zap.L().Error("Unable write image", zap.Error(err))
			return fiber.ErrInternalServerError
		}

		// get url for file
		url, err := filepath.Rel(basePath, uploadedPath)
		if err != nil {
			zap.L().Error("Failed to get url", zap.Error(err))
			return fiber.ErrInternalServerError
		}
		url = path.Join(prefix, "uploads", filepath.ToSlash(url))
		fmt.Println(url, prefix)

		return c.JSON(Response{Ok: true, Data: fiber.Map{"url": url}})
	}
}
