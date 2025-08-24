# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.18.1

FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

# Build
FROM base AS build

COPY --link package.json package-lock.json .
RUN npm install

COPY --link . .

RUN npm run build
RUN npm run build-backend
RUN npm prune

# Run
FROM base

ENV NODE_ENV=production

COPY --from=build /app/app.cjs /app/app.cjs
COPY --from=build /app/dist /app/dist

WORKDIR /app

VOLUME /app/data

ENV PUBLIC_ORIGIN=http://localhost:8000
ENV PORT=8000

EXPOSE 8000

CMD [ "node", "./app.cjs" ]