#!/bin/bash

set -euo pipefail

working_dir="~/workspace/texecom-simple-ui"

# first tag old version before we make any changes
ssh "$device" "cd $working_dir && docker tag \$(docker compose images -q app) texecom-simple-ui:last-working"

# now deploy new code and image
pnpm run docker:deploy
scp docker-compose.yml $device:$working_dir/
echo "=================="
echo "Run the following:"
echo "cd $working_dir/"
echo "# (optional) vim .env"
echo "docker compose down && docker compose up -d && docker compose logs --follow --timestamps"
echo "=================="
ssh $device
