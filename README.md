# Chess

A toy project for implementing an online chess platform.

The project contains 4 packages, located in the `packages` directory:

- `chess-game` - Implements the chess rules.
- `chess-server` - Server for hosting chess games and managing user accounts.
- `chess-client` - Web-based client application for displaying the chess UI.
- `chess-shared-types` - Contains the types used by both server and client.

## Docker

The quickest way to start the services is via Docker Compose. A `.env` file can be placed in the root directory of the project to set the environment variables.

### Developer Environment

For developer environments, the compose file is configured to run three containers:

- The backend `chess-server`.
- An nginx server to host the `chess-client`.
- A PostgreSQL database.

The following environment variables can be set:

- `DB_USER` - The username to be created for the PostgreSQL database.
- `DB_PASSWORD`- The password for `DB_USER`.
- `DB_DATABASE` - The name to be given to the chess database.
- `SERVER_PORT` - The port to be used by the `chess-server` in the local machine.
- `CLIENT_PORT`- The port to be used by the nginx server in the local machine.
- `DISABLE_REGISTRATION` (Optional) - Set to `true` to disable form for user registration. Defaults to `false`.

The containers can be started with the following command:

```
docker compose -f compose.yaml -f compose.dev.yaml up
```

### Production Environment

For production environments, the compose file is configured to run only two containers:

- The backend `chess-server`.
- An nginx server to host the `chess-client`.

A PostgreSQL server is expected to be configured separately with a user and a database created to manage and store the chess data. The PostgreSQL server should be running and reachable from the `chess-server` container. The tables do not need to be created manually as migrations are automatically run by Docker Compose when the services are started.

The following environment variables can be set:

- `DB_HOST` - Hostname or IP address of the PostgreSQL server.
- `DB_PORT` - The port on which the PostgreSQL server is listening on.
- `DB_USER` - The username to be used to access the database.
- `DB_PASSWORD`- The password for `DB_USER`.
- `DB_DATABASE` - The name of the database containing the chess-related data.
- `SERVER_BASE_URL` - The base URL of the `chess-server` container.
- `SERVER_CORS_ORIGIN` - Allowed origin for cross-origin requests to the server. This should be set to the origin of the nginx server.
- `SERVER_PORT` - The port to be used by the `chess-server` in the local machine.
- `CLIENT_PORT`- The port to be used by the nginx server in the local machine.
- `DISABLE_REGISTRATION` (Optional) - Set to `true` to disable form for user registration. Defaults to `false`.

The containers can be started with the following command:

```
docker compose up
```

## Local Setup

For those who want to run the services outside of Docker, your local machine must be set up to be able to build and run the services. Ensure that the following prerequisites are met:

- Node.js v22.11.0
- npm v10.9.0

The project can be setup as follows:

1. Run `npm install` to install dependencies.
2. Run `npx husky` to setup pre-commit hooks.

Instructions on how to build and run the server and the client can be found in their corresponding `README.md` files located in their respective package directories.

## Asset Credits

- SVG Chess pieces: [Chess Simple Assets](https://www.figma.com/community/file/971870797656870866/chess-simple-assets) by Maciej Świerczek is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
