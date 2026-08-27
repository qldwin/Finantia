import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from '../drizzle/schema/index';
import {useRuntimeConfig} from '#imports';


const config = useRuntimeConfig();
const connectionString = config.databaseUrl;

if (!connectionString) {
    throw new Error("❌ ERREUR : La variable databaseUrl est VIDE. Vérifiez NUXT_DATABASE_URL dans les variables d'environment.");
}

const pool = new Pool({
    connectionString: connectionString,
});

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue sur un client de la pool DB :', err);
    process.exit(1);
});

export const db = drizzle(pool, {schema});

const RETRY_DELAY_MS = 5000;

async function connectWithRetry() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log("🔌 Connexion DB OK !");
    } catch (err) {
        console.error(`❌ Échec de la connexion DB (nouvel essai dans ${RETRY_DELAY_MS / 1000}s) :`, err);
        setTimeout(connectWithRetry, RETRY_DELAY_MS);
    }
}

connectWithRetry();