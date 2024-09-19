# This file was auto-generated, do not edit it directly.
# Instead run bin/update_build_scripts from
# https://github.com/overleaf/internal/

FROM node:18.20.2 as base

WORKDIR /overleaf/services/clsi
COPY services/clsi/install_deps.sh /overleaf/services/clsi/
RUN chmod 0755 ./install_deps.sh && ./install_deps.sh
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
COPY services/clsi/entrypoint.sh /

# Google Cloud Storage needs a writable $HOME/.config for resumable uploads
# (see https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream)
RUN mkdir /home/node/.config && chown node:node /home/node/.config

FROM base as app

COPY package.json package-lock.json .npmrc /overleaf/
COPY services/clsi/package.json .npmrc /overleaf/services/clsi/
COPY libraries/ /overleaf/libraries/
COPY patches/ /overleaf/patches/

ENV http_proxy http://192.168.110.105:10809
ENV https_proxy http://192.168.110.105:10809

RUN cd /overleaf && npm ci --quiet

COPY services/clsi/ /overleaf/services/clsi/

FROM app
RUN mkdir -p cache compiles output \
&&  chown node:node cache compiles output

CMD ["node", "--expose-gc", "app.js"]
