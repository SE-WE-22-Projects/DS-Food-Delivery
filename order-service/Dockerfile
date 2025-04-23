FROM golang:latest AS builder
WORKDIR /build
COPY ./ ./
RUN GOFLAGS=-mod=vendor CGO_ENABLED=0 go build -o ./main ./cmd/order-service


FROM scratch
WORKDIR /app
COPY --from=builder /build/main ./main
COPY ./cmd/order-service/*.key ./
COPY ./cmd/order-service/config.toml ./
EXPOSE 5000
ENTRYPOINT ["./main"]