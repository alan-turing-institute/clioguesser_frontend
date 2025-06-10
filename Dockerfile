# Dockerfile.dev
FROM node:20
WORKDIR /app

COPY svelte-map-app/package*.json ./
RUN npm install

COPY svelte-map-app ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
