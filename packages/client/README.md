# Chess Client

A React application for the chess UI. The app is written in TypeScript and built using Vite.

## Setting Environment Variables

Ensure that the following environment variables are set during build time:

- `VITE_SERVER_BASE_URL` - The base URL of the backend server that hosts the chess games.

## Building the Client

Vite is used to build the web application. Run the command

```
npm -w chess-client run build
```

to bundle the React app to the `dist` directory of the package. Once bundled, this directory would contain all the necessary HTML, CSS, JS, and other assets needed to run the web application. This can then be hosted on a web server like nginx in production.

## Running a Dev Server

During development, a dev server can be run with

```
npm -w chess-client run dev
```
