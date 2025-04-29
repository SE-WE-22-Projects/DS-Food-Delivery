FROM node:latest AS builder
WORKDIR /build
COPY ./ ./
RUN --mount=type=cache,target=/build/node_modules npm ci

FROM node:latest
WORKDIR /usr/app
COPY --from=builder /build/ ./
EXPOSE 5000
CMD ["npm", "run", "start"]