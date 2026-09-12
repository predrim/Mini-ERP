import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createCategorySchema = z.object({
    name: z.string().min(1, "The name cannot be empty.")
});

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
    try {
        const validatedData = createCategorySchema.parse(req.body);

        const newCategory = await prisma.categories.create({
            data: {
                name: validatedData.name,
            }
        });
        res.status(201).json(newCategory);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues[0].message });
        }
        else {
            res.status(400).json({ error: "Invalid Data" })
        };
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const validatedData = createCategorySchema.parse(req.body);

        const updatedCategory = await prisma.categories.update({
            where: { id: Number(req.params.id) },
            data: { name: validatedData.name }
        });

        res.status(200).json(updatedCategory);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues[0].message });
        }
        else {
            res.status(400).json("Invalid Data");
        };
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