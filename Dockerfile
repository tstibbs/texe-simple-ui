FROM node:20-bookworm-slim

ENV NPM_CONFIG_ENGINE_STRICT=true

WORKDIR /usr/src/app

# do this before copying in any application files, to allow more rapid rebuilding if the app code is changing without any dependency changes
COPY app/package*.json ./
RUN npm ci --omit=dev

COPY app/*.js ./
COPY app/backend backend
COPY app/public public

CMD [ "npm", "run", "start" ]
