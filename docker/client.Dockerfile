FROM node:22.11.0-alpine AS builder
ARG SERVER_BASE_URL
ENV VITE_SERVER_BASE_URL=$SERVER_BASE_URL
WORKDIR /chess
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/client/package.json packages/client/
RUN npm install
COPY packages/shared-types packages/shared-types/
COPY packages/client packages/client/
RUN npm -w chess-client run build

FROM nginx:1.26.3-alpine
COPY --from=builder /chess/packages/client/dist /chess/packages/client/dist/
COPY docker/client.nginx.conf /etc/nginx/nginx.conf
