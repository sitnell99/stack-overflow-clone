## Installation

```bash
$ npm install
```

## Create .env files based on example.env files in the following directories
- project root directory
- src/ directory

## Run docker compose services

```bash
$ docker compose up -d
```

## Run database migration

1. Open app docker container terminal
```bash
$ docker exec -it app sh
```
2. Run migration
```bash
$ npm run typeorm migration:run
```

## Show docker containers logs
```bash
$ docker compose logs -f -t
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Swagger documentation 

 http://<application_host>:<application_port>/api
 
 For example: http://localhost:8000/api

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```