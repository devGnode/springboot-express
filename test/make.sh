#!/bin/sh

DIR=$( dirname $PWD )
VERSION=$( cat ../pod_version )

IMAGE_NAME=node-alpine-img
POD_NAME=vpod-node-alpine

WWW_RUNNER=src/runner/main.ts
# Next Feature
# WWW_ARGS="--http false --https 8443 --auth false --listen 0.0.0.0 --hostname "

PORT=8443:8443


docker run -tid --name ${POD_NAME}-${VERSION} \
    --restart=always \
    -p ${PORT} \
    -e WWW_RUNNER=${WWW_RUNNER} \
    -e WWW_ARGS=${WWW_ARGS} \
    --volume /usr/local/share/ca-certificates:/usr/local/share/ca-certificates \
    ${IMAGE_NAME}:${VERSION}