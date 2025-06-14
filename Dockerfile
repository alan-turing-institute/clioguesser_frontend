# Dockerfile.dev
FROM node:20
WORKDIR /app

COPY my-app/package*.json ./
RUN npm install

COPY my-app ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
