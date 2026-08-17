import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
    const newProduct = await prisma.products.create({
        data: {
            name: req.body.name,
            price: Number(req.body.price),
            description: req.body.description,
            categoryId: Number(req.body.categoryId),
        },
        include: {
            category: true,
        }
    });
    res.status(201).json(newProduct)
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const updatedProduct = await prisma.products.update({
            where: { id: Number(req.params.id) },
            data: {
                name: req.body.name,
                price: Number(req.body.price),
                description: req.body.description,
                categoryId: Number(req.body.categoryId),
            },
            include: {
                category: true,
            }
        });

        res.status(200).json(updatedProduct);
    }
    catch {
        res.status(404).json("Product not found");

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