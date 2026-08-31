import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, { message: "A password is required." })
});

export const loginHandler = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const foundRegister = await prisma.employees.findUnique({
            where: {
                email: validatedData.email
            }
        });
        const invalidCredentials: string = "Error: Wrong email or password";

        if (!foundRegister) {
            throw new Error(invalidCredentials);
        };

        const isMatch = await bcrypt.compare(validatedData.password, foundRegister.password);

        if (!isMatch) {
            throw new Error(invalidCredentials);
        };

        const { password, ...newLogin } = foundRegister;
        res.status(200).json(newLogin);

    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues[0].message });
        }
        else if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Error when trying to login" });
        };
    };
};