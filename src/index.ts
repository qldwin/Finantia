import db from './db';
import { users } from './schema';

async function main() {
    const allUsers = await db.select().from(users);
    console.log(allUsers);
}

main();