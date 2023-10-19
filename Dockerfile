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

# example commands to deploy onto the device that will be running this
# (for dev it's probably simpler than pushing out a container image)
#
# ssh $device mkdir -p ~/workspace/texecom-simple-ui/app
# scp -r app/*.js* app/backend app/public $device:~/workspace/texecom-simple-ui/app
# scp -r Dockerfile docker-compose.yml $device:~/workspace/texecom-simple-ui/
# scp app/.env $device:~/workspace/texecom-simple-ui/
# ssh $device
#    cd ~/workspace/texecom-simple-ui/
#    docker compose up -d
