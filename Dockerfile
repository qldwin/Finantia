FROM node:22 AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --ignore-scripts

# Copier tout le projet
COPY . ./

# Build Nuxt
RUN npm run build


FROM node:22-slim
WORKDIR /app

RUN npm i -g drizzle-kit@0.31.10 pg@latest drizzle-orm@latest --ignore-scripts

COPY --from=builder /app/.output/ ./
COPY --from=builder /app/drizzle-migrations/ ./drizzle-migrations
COPY --from=builder /app/drizzle.config.ts .
COPY --from=builder /app/entrypoint.sh .

RUN chown -R node:node /app

USER node

EXPOSE 3000
ENTRYPOINT [ "bash", "./entrypoint.sh" ]
