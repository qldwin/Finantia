# Étape 1 : builder Nuxt
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le projet
COPY . ./

# Build Nuxt
RUN npm run build

# Étape 2 : image finale pour production
FROM node:20-alpine

WORKDIR /app

# Copier le build depuis l'image builder
COPY --from=builder /app/.output ./

# Installer uniquement les dépendances de production
COPY package*.json ./
RUN npm install --production

EXPOSE 3000

# Lancer Nuxt
CMD ["npm", "start"]
