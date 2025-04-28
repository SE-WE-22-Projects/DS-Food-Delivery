FROM golang:latest AS builder
ENV GOPATH=/go
ENV GOCACHE=/go-build
ENV GOFLAGS=-mod=vendor
ENV CGO_ENABLED=0
WORKDIR /build
COPY ./ ./
RUN --mount=type=cache,target=/go/pkg/mod/cache \
--mount=type=cache,target=/go-build \
 go build -o ./main ./cmd/upload-service


FROM scratch
WORKDIR /app
COPY --from=builder /build/main ./main
COPY ./cmd/upload-service/config.default.toml ./
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
EXPOSE 5000
EXPOSE 5001
ENTRYPOINT ["./main"]