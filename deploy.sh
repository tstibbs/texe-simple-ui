#!/bin/bash

set -euo pipefail

gitCommit=$(git rev-parse HEAD)
if [ -n "$(git status -s)" ]
then
	gitCommit="$gitCommit+"
fi

ssh $device mkdir -p ~/workspace/texecom-simple-ui/app
scp -r app/*.js* app/backend app/public $device:~/workspace/texecom-simple-ui/app
scp -r Dockerfile docker-compose.yml $device:~/workspace/texecom-simple-ui/
echo "=================="
echo "Run the following:"
echo "cd ~/workspace/texecom-simple-ui/"
echo "docker tag \$(docker compose images -q app) texecom-simple-ui:last-working"
echo "export commit=$gitCommit && docker compose build"
echo "# (optional) vim .env"
echo "docker compose down && docker compose up -d && docker compose logs --follow --timestamps"
echo "=================="
ssh $device
