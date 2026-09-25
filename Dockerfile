#Running locally:
#docker run -P -it $(docker build -q .)
FROM nginx:stable-alpine

EXPOSE 80
## Enable gzip
RUN echo "  \
  gzip on; \
  gzip_comp_level 2; \
  gzip_http_version 1.0; \
  gzip_proxied any; \
  gzip_min_length 1100; \
  gzip_buffers 16 8k; \
  gzip_types text/plain text/html text/css application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript; \
  gzip_vary on;  \
" >> /etc/nginx/conf.d/gzip_compression.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY ./dist/signal-grid-site /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]