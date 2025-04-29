FROM node:latest
WORKDIR /usr/app
COPY ./ ./
RUN  npm ci
EXPOSE 5000
CMD  ["npm", "run", "start"]