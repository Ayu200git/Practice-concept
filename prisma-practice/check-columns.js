import { prisma } from './db.js';

async function diagnose() {
    try {
        console.log("--- DB Column Check ---");
        const result = await prisma.$queryRawUnsafe(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User';
        `);
        console.log("Columns in DB:", JSON.stringify(result, null, 2));

        if (result.length === 0) {
            const resultLower = await prisma.$queryRawUnsafe(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'user';
            `);
            console.log("Columns in DB (lowercase 'user'):", JSON.stringify(resultLower, null, 2));
        }

    } catch (err) {
        console.error("DIAGNOSTIC ERROR:", err.message);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

diagnose();
