import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createEmployeeSchema = z.object({
    name: z.string().min(1, "The name cannot be empty."),
    cpf: z.string().length(11, "The CPF must contain 11 digits."),
    email: z.email(),
    password: z.string()
        .trim()
        .min(1, {message: "A password is required."})
        .min(8, {message: "The password must be at least 8 characters long."})
        .max(100, {message: "The password is too long."})
        .regex(/[A-Z]/, {message: "The password must contain at least one uppercase letter."})
        .regex(/[a-z]/, {message: "The password must contain at least one lowercase letter."})
        .regex(/[0-9]/, {message: "The password must contain at least one number."})
        .regex(/[^A-Za-z0-9]/, {message: "The password must contain at least one special character."}),
    position: z.string()
})

const updateEmployeeSchema = z.object({
    name: z.string().min(1, "The name cannot be empty.").optional(),
    cpf: z.string().length(11, "The CPF must contain 11 digits.").optional(),
    email: z.email().optional(),
    password: z.string()
        .trim()
        .min(1, {message: "A password is required."})
        .min(8, {message: "The password must be at least 8 characters long."})
        .max(100, {message: "The password is too long."})
        .regex(/[A-Z]/, {message: "The password must contain at least one uppercase letter."})
        .regex(/[a-z]/, {message: "The password must contain at least one lowercase letter."})
        .regex(/[0-9]/, {message: "The password must contain at least one number."})
        .regex(/[^A-Za-z0-9]/, {message: "The password must contain at least one special character."})
        .optional(),
    position: z.string().optional()
})

export const listEmployees = async (req: Request, res: Response) => {
    const employees = await prisma.employees.findMany();
    res.status(200).json(employees)
};

export const getEmployeeById = async (req: Request, res: Response) => {
    const foundEmployee = await prisma.employees.findUnique({
        where: {
            id: Number(req.params.id),
        }
    });

    if (foundEmployee) {
        res.status(200).json(foundEmployee);
    }
    else {
        res.status(404).json("Employee not found");
    };
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const validatedData = createEmployeeSchema.parse(req.body)        

        const newEmployee = await prisma.employees.create({
            data: {
                name: validatedData.name,
                cpf: validatedData.cpf,
                email: validatedData.email,
                password: validatedData.password,
                position: validatedData.position
            }
        });
        res.status(201).json(newEmployee)
    }
    catch (error) {
        res.status(400).json({error: "Invalid Data"})
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const validatedData = updateEmployeeSchema.parse(req.body);

        const updatedEmployee = await prisma.employees.update({
            where: {id: Number(req.params.id)},
            data: {
                name: validatedData.name,
                cpf: validatedData.cpf,
                email: validatedData.email,
                password: validatedData.password,
                position: validatedData.position
            }
        });

        res.status(200).json(updatedEmployee);
    }
    catch {
        res.status(400).json("Invalid Data");

    };
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const deletingEmployee = await prisma.employees.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(200).json(deletingEmployee);
    }
    catch {
        res.status(404).json("Employee not found");
    };
};