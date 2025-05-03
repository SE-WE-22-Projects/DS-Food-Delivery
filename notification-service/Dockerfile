FROM node:latest AS builder
WORKDIR /build
COPY ./ ./
RUN npm i
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]