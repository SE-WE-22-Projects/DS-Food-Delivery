FROM node:latest
WORKDIR /usr/app
COPY ./package.json ./
RUN --mount=type=cache,target=/app/node_modules npm install
COPY ./ ./
EXPOSE 5000
CMD ["npm", "run", "start"]