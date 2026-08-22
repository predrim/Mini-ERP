import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// validates data sent from front-end (req.body) 
const createProductSchema = z.object({
    name: z.string().min(1, "The name cannot be empty."),
    price: z.number().nonnegative("The price cannot be a negative number."),
    description: z.string().optional(),
    categoryId: z.int()
});

const updateProductSchema = z.object({
    name: z.string().min(1, "The name cannot be empty.").optional(),
    price: z.number().nonnegative("The price cannot be a negative number.").optional(),
    description: z.string().optional(),
    categoryId: z.int().optional()
});

export const listProducts = async (req: Request, res: Response) => {
    const products = await prisma.products.findMany({
        include: {
            category: true,
        }

    });
    res.status(200).json(products)
};

export const getProductById = async (req: Request, res: Response) => {
    const foundProduct = await prisma.products.findUnique({
        where: {
            id: Number(req.params.id),
        },
        include: {
            category: true,
        }
    });

    if (foundProduct) {
        res.status(200).json(foundProduct);
    }
    else {
        res.status(404).json("Product not found");
    };
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const validatedData = createProductSchema.parse(req.body);

        const newProduct = await prisma.products.create({
            data: {
                name: validatedData.name,
                price: validatedData.price,
                description: validatedData.description,
                categoryId: validatedData.categoryId,
            },
            include: {
                category: true,
            }
        });
        res.status(201).json(newProduct);

    }
    catch (error) {
        res.status(400).json({ error: "Invalid Data" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const validatedData = updateProductSchema.parse(req.body);

        const updatedProduct = await prisma.products.update({
            where: {id: Number(req.params.id)},
            data: {
                name: validatedData.name,
                price: validatedData.price,
                description: validatedData.description,
                categoryId: validatedData.categoryId,
            },
            include: {
                category: true,
            }
        });

        res.status(200).json(updatedProduct);
    }
    catch {
        res.status(400).json("Invalid Data");

    };
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const deletingProduct = await prisma.products.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(200).json(deletingProduct);
    }
    catch {
        res.status(404).json("Product not found");
    };
};