import { prisma } from './db.js';

async function check() {
    try {
        console.log("Checking User model...");
        const users = await prisma.user.findMany();
        console.log("Success! Found users:", users.length);
        if (users.length > 0) {
            console.log("First user fields:", Object.keys(users[0]));
        }
    } catch (err) {
        console.error("PRISMA ERROR DETECTED:");
        console.error(err);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

check();
