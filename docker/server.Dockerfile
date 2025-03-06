FROM node:22.11.0-alpine AS node_base
WORKDIR /chess
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/game/package.json packages/game/
COPY packages/server/package.json packages/server/

FROM node_base AS builder
RUN npm install
COPY packages/shared-types packages/shared-types/
COPY packages/game packages/game/
COPY packages/server packages/server/
RUN npm -w chess-game run build && npm -w chess-server run build

FROM node_base
RUN npm install --omit=dev
ENV PORT=80
EXPOSE 80
COPY --from=builder /chess/packages/game/dist /chess/packages/game/dist/
COPY --from=builder /chess/packages/server/dist /chess/packages/server/dist/
CMD ["npm", "-w", "chess-server", "run", "start"]
