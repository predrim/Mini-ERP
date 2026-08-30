import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createTransactionSchema = z.object({
    quantity: z.int().positive("There must be at least one item in the transaction."),
    type: z.enum(["INFLOW", "OUTFLOW"]),
    reason: z.enum(["RETURN", "STOCK_ADDITION", "MANUAL_ADJUSTMENT", "LOSS"]),
    productId: z.int(),
    employeeId: z.int()
});

export const listTransactions = async (req: Request, res: Response) => {
    const transactions = await prisma.transactions.findMany({include: {product: true, employee: true} });
    res.status(200).json(transactions);
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const validatedData = createTransactionSchema.parse(req.body);

        const newTransaction = await prisma.transactions.create({
            data: {
                quantity: validatedData.quantity,
                type: validatedData.type,
                reason: validatedData.reason,
                productId: validatedData.productId,
                employeeId: validatedData.employeeId
            }
        });
        res.status(201).json(newTransaction);

    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues[0].message });
        }
        else {
            res.status(400).json({ error: "Invalid Data" });
        }
    }
};
