import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const listCustomers = async (req: Request, res: Response) => {
    const customers = await prisma.customers.findMany();
    res.status(200).json(customers)
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
    const newCustomer = await prisma.customers.create({
        data: {
            name: req.body.name,
            cpf: req.body.cpf,
        }
    });
    res.status(201).json(newCustomer)
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const updatedCustomer = await prisma.customers.update({
            where: { id: Number(req.params.id) },
            data: {
                name: req.body.name,
                cpf: req.body.cpf,
            }
        });

        res.status(200).json(updatedCustomer);
    }
    catch {
        res.status(404).json("Customer not found");

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