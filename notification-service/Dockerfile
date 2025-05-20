FROM node:latest AS builder
WORKDIR /build
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci
COPY ./ ./
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]