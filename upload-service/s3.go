package uploadservice

import (
	"errors"
	"io"
	"io/fs"
	"os"
	"path"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/service/s3"
	"go.uber.org/zap"
)

// S3Upload uploads a file to S3.
func (s *Server) S3Upload(name string, content io.ReadSeeker) error {
	if s.s3 == nil {
		// s3 disabled, return nil
		return nil
	}

	zap.L().Debug("Uploading file from s3", zap.String("file", name))
	_, err := s.s3.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(s.cfg.S3.Bucket),
		Key:    aws.String(name),
		Body:   content,
	})

	return err
}

// S3Download downloads a file from S3.
func (s *Server) S3Download(name string) error {
	if s.s3 == nil {
		// s3 disabled, return file not found
		return fs.ErrNotExist
	}

	_, err, _ := s.singleflight.Do(name, func() (any, error) {
		if _, ok := s.notFound.Load(name); ok {
			return nil, fs.ErrNotExist
		}

		zap.L().Debug("Downloading file from s3", zap.String("file", name))

		tmpName := name + ".tmp"

		err := s.fs.MkdirAll(path.Dir(name), 0o777)
		if err != nil {
			return nil, err
		}

		// remove temp file if it exists
		err = s.fs.Remove(tmpName)
		if err != nil && !os.IsNotExist(err) {
			return nil, err
		}

		// create tmp file
		tmp, err := s.fs.Create(tmpName)
		if err != nil {
			return nil, err
		}
		defer tmp.Close()

		// download to file
		_, err = s.s3Downloader.Download(tmp,
			&s3.GetObjectInput{
				Bucket: aws.String(s.cfg.S3.Bucket),
				Key:    aws.String(name),
			})
		if err != nil {
			// handle file not found error
			var s3Err awserr.RequestFailure
			if errors.As(err, &s3Err) && s3Err.Code() == s3.ErrCodeNoSuchKey {
				_ = tmp.Close()
				_ = s.fs.Remove(tmpName)

				s.notFound.Store(name, true)

				return nil, fs.ErrNotExist
			}

			return nil, err
		}

		return nil, s.fs.Rename(tmpName, name)
	})

	return err
}
