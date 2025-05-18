import { initializeDatabase } from '../utils/database';

export default defineNitroPlugin(async () => {
  // Initialiser la base de données au démarrage
  try {
    await initializeDatabase();
    console.log('🚀 Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
}); 