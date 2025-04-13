FROM golang:latest AS builder
ENV GOPATH=/go
ENV GOCACHE=/go-build
ENV GOFLAGS=-mod=vendor
ENV CGO_ENABLED=0
WORKDIR /build
COPY ./ ./
RUN --mount=type=cache,target=/go/pkg/mod/cache \
--mount=type=cache,target=/go-build \
 go build -o ./main ./cmd/user-service


FROM scratch
WORKDIR /app
COPY --from=builder /build/main ./main
COPY ./cmd/user-service/*.key ./
COPY ./cmd/user-service/config.toml ./
EXPOSE 5000
ENTRYPOINT ["./main"]