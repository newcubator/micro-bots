FROM alpine

RUN apk add curl tar
RUN curl -s https://download.docker.com/linux/static/stable/x86_64/docker-23.0.1.tgz | tar -xzf-

FROM node:21.4.0-alpine

RUN apk add --no-cache aws-cli docker-cli

CMD [ "sh" ]
