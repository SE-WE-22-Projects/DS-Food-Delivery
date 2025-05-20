FROM nginx:latest
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "service nginx status || exit 1" ]
ENTRYPOINT ["nginx","-g","daemon off;"]