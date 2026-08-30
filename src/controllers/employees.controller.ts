import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createEmployeeSchema = z.object({
    name: z.string().min(1, "The name cannot be empty."),
    cpf: z.string().length(11, "The CPF must contain 11 digits."),
    email: z.email(),
    password: z.string()
        .trim()
        .min(1, { message: "A password is required." })
        .min(8, { message: "The password must be at least 8 characters long." })
        .max(100, { message: "The password is too long." })
        .regex(/[A-Z]/, { message: "The password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "The password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "The password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "The password must contain at least one special character." }),
    position: z.string()
})

const updateEmployeeSchema = z.object({
    name: z.string().min(1, "The name cannot be empty.").optional(),
    cpf: z.string().length(11, "The CPF must contain 11 digits.").optional(),
    email: z.email().optional(),
    password: z.string()
        .trim()
        .min(1, { message: "A password is required." })
        .min(8, { message: "The password must be at least 8 characters long." })
        .max(100, { message: "The password is too long." })
        .regex(/[A-Z]/, { message: "The password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "The password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "The password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "The password must contain at least one special character." })
        .optional(),
    position: z.string().optional()
})

export const listEmployees = async (req: Request, res: Response) => {
    const employees = await prisma.employees.findMany();

    let employeesWithoutPassword = employees.map(employee => {
        const { password, ...employeeWithoutPassword } = employee;
        return employeeWithoutPassword;
    });

    res.status(200).json(employeesWithoutPassword);
};

export const getEmployeeById = async (req: Request, res: Response) => {
    const foundEmployee = await prisma.employees.findUnique({
        where: {
            id: Number(req.params.id),
        }
    });

    if (foundEmployee) {
        const { password, ...employeeWithoutPassword } = foundEmployee;
        res.status(200).json(employeeWithoutPassword);
    }
    else {
        res.status(404).json("Employee not found");
    };
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const validatedData = createEmployeeSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const newEmployee = await prisma.employees.create({
            data: {
                name: validatedData.name,
                cpf: validatedData.cpf,
                email: validatedData.email,
                password: hashedPassword,
                position: validatedData.position
            }
        });
        const { password, ...employeeWithoutPassword } = newEmployee;
        res.status(201).json(employeeWithoutPassword)
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

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const validatedData = updateEmployeeSchema.parse(req.body);

        let dataToUpdate: any = {
            name: validatedData.name,
            cpf: validatedData.cpf,
            email: validatedData.email,
            position: validatedData.position
        }

        if (validatedData.password) {
            dataToUpdate.password = await bcrypt.hash(validatedData.password, 10);
        }

        const updatedEmployee = await prisma.employees.update({
            where: { id: Number(req.params.id) },
            data: dataToUpdate
        });

        res.status(200).json(updatedEmployee);
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

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const deletingEmployee = await prisma.employees.delete({
            where: { id: Number(req.params.id) },
        });
        const { password, ...employeeWithoutPassword } = deletingEmployee;
        res.status(200).json(employeeWithoutPassword);
    }
    catch {
        res.status(404).json("Employee not found");
    };
};