# Chess Server

The package contains the server for hosting chess games. The server is built using TypeScript with the NestJS framework. PostgreSQL is used to store user accounts. WebSockets are used for bidirectional communication during a chess game.

## Setup

Ensure that the following prerequisites are met:

- Node.js v22.11.0
- npm v10.9.0
- PostgreSQL v16

The server depends on the `chess-game` package of the project to be built. Refer to the `README` of the `chess-game` package for info on how to build the package.

## Building the Server

To build the server, run

```
npm -w chess-server run build
```

To build the server with source maps for development, run

```
npm -w chess-server run build:dev
```

## Setting Environment Variables

A `.env` file can be placed within the package directory for setting the environment variables.

- `NODE_ENV` - Either `production` or `development`. Defaults to `production`.
- `DB_HOST` - Hostname or IP address of the PostgreSQL server.
- `DB_PORT` - The port on which the PostgreSQL server is listening on.
- `DB_USER` - The username to be used to access the database.
- `DB_PASSWORD`- The password for `DB_USER`.
  - Alternatively, the `DB_PASSWORD_FILE` env variable can be set to the filepath containing the password.
- `DB_DATABASE` - The name of the database containing the chess-related data.
- `CORS_ORIGIN` - Allowed origin for cross-origin requests. Should be typically set to the origin of the `chess-client`.
- `DISABLE_REGISTRATION` - Indicates whether anonymous users can create new accounts. Either `true` or `false`. Defaults to `false`.

## Running Migrations

Kysely is used to handle database migrations. Before running the migrations, ensure that all DB-related environment variables are set. Run the following command to apply the latest schema to the database:

```
npx -w chess-server kysely migrate:latest
```

## Running the Server

To start the server, run the command:

```
npm -w chess-server run start
```

## Running Unit Tests

```
npm -w chess-server run test
```
