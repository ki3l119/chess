FROM node:22.11.0-alpine AS node_base
USER node
ENV UID=1000
ENV PROJECT_DIR=/home/node/chess
WORKDIR $PROJECT_DIR
COPY --chown=$UID package.json package-lock.json ./
COPY --chown=$UID packages/shared-types/package.json packages/shared-types/
COPY --chown=$UID packages/game/package.json packages/game/
COPY --chown=$UID packages/server/package.json packages/server/

FROM node_base AS builder
RUN npm install
COPY --chown=$UID packages/shared-types packages/shared-types/
COPY --chown=$UID packages/game packages/game/
COPY --chown=$UID packages/server packages/server/
RUN npm -w chess-game run build && npm -w chess-server run build

FROM node_base
RUN npm install --omit=dev
ENV PORT=80
EXPOSE 80
COPY --from=builder $PROJECT_DIR/packages/game/dist $PROJECT_DIR/packages/game/dist/
COPY --from=builder $PROJECT_DIR/packages/server/dist $PROJECT_DIR/packages/server/dist/
CMD ["npm", "-w", "chess-server", "run", "start"]
