import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createCustomerSchema = z.object({
    name: z.string().min(1, "The name cannot be empty."),
    cpf: z.string().length(11, "The CPF must have 11 digits.")
});

const updateCustomerSchema = z.object({
    name: z.string().min(1, "The name cannot be empty.").optional(),
    cpf: z.string().length(11, "The CPF must have 11 digits.").optional()
});

export const listCustomers = async (req: Request, res: Response) => {
    const customers = await prisma.customers.findMany();
    res.status(200).json(customers);
};

export const getCustomerById = async (req: Request, res: Response) => {
    const foundCustomer = await prisma.customers.findUnique({
        where: {
            id: Number(req.params.id),
        }
    });

    if (foundCustomer) {
        res.status(200).json(foundCustomer);
    }
    else {
        res.status(404).json("Customer not found");
    };
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const validatedData = createCustomerSchema.parse(req.body);

        const newCustomer = await prisma.customers.create({
            data: {
                name: validatedData.name,
                cpf: validatedData.cpf,
            }
        });
        res.status(201).json(newCustomer)
    }
    catch (error) {
        res.status(400).json({error: "Invalid Data"})
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const validatedData = updateCustomerSchema.parse(req.body);

        const updatedCustomer = await prisma.customers.update({
            where: { id: Number(req.params.id) },
            data: {
                name: validatedData.name,
                cpf: validatedData.cpf,
            }
        });

        res.status(200).json(updatedCustomer);
    }
    catch {
        res.status(400).json("Invalid Data");

    };
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const deletingCustomer = await prisma.customers.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(200).json(deletingCustomer);
    }
    catch {
        res.status(404).json("Customer not found");
    };
};