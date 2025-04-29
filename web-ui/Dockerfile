FROM node:latest AS build
WORKDIR /app
COPY package.json ./
RUN --mount=type=cache,target=/app/node_modules npm install
ENV PATH=/app/node_modules/.bin:$PATH
COPY . .
RUN  --mount=type=cache,target=/app/node_modules npm run build

FROM nginx:latest
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]