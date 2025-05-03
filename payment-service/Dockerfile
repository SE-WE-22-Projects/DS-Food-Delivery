FROM node:latest AS builder
WORKDIR /build
COPY ./ ./
RUN npm i
EXPOSE 5000
CMD ["npm", "run", "start"]