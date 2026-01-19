import pkgClient from "@prisma/client";
const { PrismaClient } = pkgClient;
import * as pkgAdapter from "@prisma/adapter-pg";
const { PrismaPg } = pkgAdapter;
import pkgPg from "pg";
const { Pool } = pkgPg;
import "dotenv/config";

let prisma;
try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} catch (error) {
    console.error("Prisma client failed to initialize:", error);
    process.exit(1);
}

export { prisma };
