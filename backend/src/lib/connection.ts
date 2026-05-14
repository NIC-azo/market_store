import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config'

// ver README.MD 10 - 30
const prismaGlobalVariable = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
}

const connection_str = process.env.NODE_ENV === "dev"
    ? process.env.LOCAL_DATABASE_URL! : process.env.DATABASE_URL!;

const connectionPool = prismaGlobalVariable.pool ?? new Pool({
    connectionString: connection_str,
    ssl: process.env.NODE_ENV === "dev" ? { rejectUnauthorized: false } : true
});

const adapter = new PrismaPg(connectionPool);

const prismaInstance = prismaGlobalVariable.prisma ?? new PrismaClient({
    adapter: adapter,
    log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV === "dev") {
    prismaGlobalVariable.pool = connectionPool;
    prismaGlobalVariable.prisma = prismaInstance;
}

export default prismaInstance;