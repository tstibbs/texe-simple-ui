FROM cloud-core-base-image:build

# do this before copying in any application files, to allow more rapid rebuilding if the app code is changing without any dependency changes
COPY app/package*.json ./
COPY app/pnpm-*.yaml ./

# after copying package.json so mise can use devEngines
RUN mise install
RUN pnpm ci --prod

COPY app/*.js ./
COPY app/backend backend
COPY app/public public

CMD [ "pnpm", "run", "start" ]
