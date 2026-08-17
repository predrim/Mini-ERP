import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const listCategories = async (req: Request, res: Response) => {
    const categories = await prisma.categories.findMany();
    res.status(200).json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
    const foundCategory = await prisma.categories.findUnique({
        where: {
            id: Number(req.params.id),
        }
    });
    
    if (foundCategory) {
        res.status(200).json(foundCategory);
    }
    else {
        res.status(404).json("Category not found");
    };
};

export const createCategory = async (req: Request, res: Response) => {
    const newCategory = await prisma.categories.create({
        data: {
            name: req.body.name,
        }
    }); 
    res.status(201).json(newCategory);
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const updatedCategory = await prisma.categories.update({
            where: { id: Number(req.params.id) },
            data: { name: req.body.name }
        });
        
        res.status(200).json(updatedCategory);
    }
    catch {
        res.status(404).json("Category not found");
    };
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const deletingCategory = await prisma.categories.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(200).json(deletingCategory);
    }
    catch {
        res.status(404).json("Category not found");
    };
};