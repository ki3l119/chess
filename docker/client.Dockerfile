FROM node:22.11.0-alpine AS builder
WORKDIR /chess
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/client/package.json packages/client/
RUN npm install
COPY packages/shared-types packages/shared-types/
COPY packages/client packages/client/
ARG SERVER_BASE_URL
ARG DISABLE_REGISTRATION
ENV VITE_SERVER_BASE_URL=$SERVER_BASE_URL
ENV VITE_DISABLE_REGISTRATION=$DISABLE_REGISTRATION
RUN npm -w chess-client run build

FROM nginxinc/nginx-unprivileged:1.26.3-alpine
ENV UID=101
USER nginx
COPY --from=builder --chown=$UID /chess/packages/client/dist /chess/packages/client/dist/
COPY --chown=$UID docker/client.nginx.conf /etc/nginx/nginx.conf
