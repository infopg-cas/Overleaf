# This file was auto-generated, do not edit it directly.
# Instead run bin/update_build_scripts from
# https://github.com/overleaf/internal/

FROM node:18.20.2 as base

WORKDIR /overleaf/services/history-v1

# Google Cloud Storage needs a writable $HOME/.config for resumable uploads
# (see https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream)
RUN mkdir /home/node/.config && chown node:node /home/node/.config

# fs persistor needs a writable folder as a target for the mounted volume
RUN mkdir /buckets && chown node:node /buckets

FROM base as app

COPY package.json package-lock.json .npmrc /overleaf/
COPY services/history-v1/package.json .npmrc /overleaf/services/history-v1/
COPY libraries/ /overleaf/libraries/
COPY patches/ /overleaf/patches/

ENV http_proxy http://192.168.110.105:10809
ENV https_proxy http://192.168.110.105:10809

RUN cd /overleaf && npm ci --quiet

COPY services/history-v1/ /overleaf/services/history-v1/

FROM app
USER node

CMD ["node", "--expose-gc", "app.js"]
