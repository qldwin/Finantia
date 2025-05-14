<template>

</template>
<script>
import db from '../src/db.js'; // Assurez-vous que le chemin est correct
import { users } from '../src/schema.js'; // Assurez-vous que le chemin est correct

async function getAllUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log(allUsers);
    return allUsers;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
}

// Appeler la fonction pour obtenir tous les utilisateurs
getAllUsers().catch(console.error);

</script>
