# Chess

## Setup

Ensure that the following prerequisites are met:

- Node.js v22.11.0
- npm v10.9.0

The project can be setup as follows:

1. Run `npm install` to install dependencies.
2. Run `npx husky` to setup pre-commit hooks.

The project contains 3 packages, located in the `packages` directory:

- `chess-server` - Server for hosting chess games and managing user accounts.
- `chess-client` - Web-based client application for displaying the chess UI.
- `chess-shared-types` - Contains the types used by both server and client.

## Building the Server

The server is written in TypeScript with the NestJS framework. A PostgreSQL database is used to store information on the user accounts.

Ensure that the following environment variables are set:

- `PORT` (Optional) - The PORT in which the server will be running in. Defaults to 3000.
- `DB_URI` - The URI to the PostgreSQL database.

For development, a `.env` file can be placed in the `./packages/server` directory:

```dotenv
# Sample .env file
PORT=80
DB_URI=postgresql://postgres:password@localhost:5432/chess
```

Run the database migrations:

```
npx -w chess-server kysely migrate:latest
```

Compile the TypeScript files:

```
npm -w chess-server run build
```

Alternatively, for development, you may run

```
npm -w chess-server run build:dev
```

to output source maps for debugging.

Start the server:

```
npm -w chess-server run start
```
