# clioguesser_frontend
Front end repo for the Clioguesser historical geography game

start npm server:

docker run -it \
  -p 5173:5173 -v ${PWD}:/src \
  node:lts-alpine \
  /bin/sh

cd src/svelte-map-app

<!-- npm install vite -->
npm run dev