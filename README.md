# clioguesser_frontend

Front end repo for the Clioguesser historical geography game

## For running the app

start npm server:

```bash
docker run -it \
  -p 5173:5173 -v ${PWD}:/src \
  node:lts-alpine \
  /bin/sh

cd src/svelte-map-app

<!-- npm install vite -->
npm run dev
```

## Running the app in a docker container

Start the docker stack containing the front end. This is currently setup to work in dev mode.

```bash
docker compose up -d
```

## Linters and Formatters

1. Install the pre-commit hooks by:
   1. Installing pre-commit.
   1. Setting up the pre-commit hooks with `pre-commit install --install-hooks`.
   1. ESLint with Svelte plugin will now run whenever you do a `git commit` or if you run `pre-commit run`.
1. Run prettier with `npx prettier . --write`.
   Note that we could
