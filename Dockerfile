FROM node:20-bookworm-slim

ENV NPM_CONFIG_ENGINE_STRICT=true

WORKDIR /usr/src/app

COPY app/*.js* ./
COPY app/backend backend
COPY app/public public

RUN npm ci --omit=dev

CMD [ "node", "server.js" ]

# example commands to deploy onto the device that will be running this
# (for dev it's probably simpler than pushing out a container image)
#
# ssh $device mkdir -p ~/workspace/texecom-simple-ui/app
# scp -r app/*.js* app/backend app/public $device:~/workspace/texecom-simple-ui/app
# scp -r Dockerfile docker-compose.yml $device:~/workspace/texecom-simple-ui/
# ssh $device
#    cd ~/workspace/texecom-simple-ui/
#    docker compose up -d