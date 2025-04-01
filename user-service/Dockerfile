FROM golang:latest AS builder
WORKDIR /build
COPY ./ ./
RUN GOFLAGS=-mod=vendor CGO_ENABLED=0 go build -o ./main ./cmd/user-service


FROM scratch
WORKDIR /app
COPY --from=builder /build/main ./main
COPY ./cmd/user-service/*.key ./
COPY ./cmd/user-service/config.toml ./
EXPOSE 5000
ENTRYPOINT ["./main"]