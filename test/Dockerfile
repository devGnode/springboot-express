FROM alpine:3.12
#
USER root
#
#
#
ENV WWW_DIR=/var/www/springnoot-test \
    WWW_RUNNER=src/runner/main.ts \
    WWW_ARGS=""
#
#
#
EXPOSE 8080
EXPOSE 8443
#
# update
#
RUN apk update \
    && apk add --no-cache bash \
    ca-certificates \
    apt-transport-https \
    ca-certificates

RUN rm -rf /var/cache/apk/*
#
# CERTS
#
#COPY certs/ /certs/
RUN ca-updates-certificates
# CACERT
VOLUME ["/usr/local/share/ca-certificates"]
#
# Node
#
RUN apk add --no-cache nodejs \
    npm \
    && apk add --update nodejs \
    npm
RUN echo node --version
#
# Web
#
RUN mkdir -p /var/wwww
COPY test/springboot-test /var/www/springboot-test
#
# install
#
RUN cd /var/www/registry-portus-front-end \
    && npm install \
    && npm build
# DEV
VOLUME ["/var/www"]
#
# launcher
#
CMD ["/docker-entrypoint.sh"]