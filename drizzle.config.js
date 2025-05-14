const { defineConfig } = 'drizzle-kit';

module.exports = defineConfig({
    schema: './src/schema.ts', // Chemin vers votre schéma
    out: './drizzle', // Chemin de sortie pour les migrations
    driver: 'pg', // Pilote de base de données
    dbCredentials: {
        connectionString: process.env.DATABASE_URL, // Chaîne de connexion à votre base de données
    },
});