FROM node:24.15.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24.15.0-alpine AS runtime

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/dist ./dist

USER 1000:1000
EXPOSE 3000

CMD ["node", "dist/server.js"]
