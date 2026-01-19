import { prisma } from './db.js';

async function diagnose() {
    try {
        console.log("--- Schema Diagnostic ---");

        // Check raw table structure (Postgres)
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User';
        `;
        console.log("Actual DB Columns for 'User':", columns);

        // Try a simple findFirst
        console.log("Attempting prisma.user.findFirst()...");
        const user = await prisma.user.findFirst();
        console.log("Prisma query result:", user);

    } catch (err) {
        console.error("DIAGNOSTIC FAILED:");
        console.error(err);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

diagnose();
