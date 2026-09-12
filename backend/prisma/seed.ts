// This file is for creating the admin user.
// docker exec -it mini-erp-backend-1 npx tsx backend/prisma/seed.ts

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const hashedPassword = await bcrypt.hash('senhaS-2468', 10);

    const employee = await prisma.employees.create({
        data:{
            name: 'Admin',
            cpf: '99999999999',
            email: 'admin@erp.com',
            password: hashedPassword,
            position: 'Admin'
        },
    });

    console.log(`Employee created with ID: ${employee.id}`);
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });