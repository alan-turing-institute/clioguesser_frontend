FROM node:24-alpine AS build
WORKDIR /app

COPY my-app/package.json .
COPY my-app/package-lock.json .
COPY my-app/svelte.config.js .
COPY my-app/vite.config.ts .
COPY my-app/tsconfig.json .
RUN npm ci

COPY my-app/src ./src
COPY my-app/static ./static

RUN npm run build

ENV PORT=80

EXPOSE 80

CMD ["node", "build"]
