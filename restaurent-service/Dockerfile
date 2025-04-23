FROM golang:latest AS builder
ENV GOPATH=/go
ENV GOCACHE=/go-build
ENV GOFLAGS=-mod=vendor
ENV CGO_ENABLED=0
WORKDIR /build
COPY ./ ./
RUN --mount=type=cache,target=/go/pkg/mod/cache \
--mount=type=cache,target=/go-build \
 go build -o ./main ./cmd/restaurent-service


FROM scratch
WORKDIR /app
COPY --from=builder /build/main ./main
COPY ./cmd/restaurent-service/*.key ./
COPY ./cmd/restaurent-service/config.toml ./
EXPOSE 5000
EXPOSE 5001
ENTRYPOINT ["./main"]