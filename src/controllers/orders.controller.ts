import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const adapter: PrismaPg = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma: PrismaClient = new PrismaClient({ adapter });

const createOrderSchema = z.object({
    customerId: z.int(),
    employeeId: z.int(),
    orderItems: z.array(
        z.object({
            productId: z.int(),
            quantity: z.int().positive(),
        })
    ).min(1, "The order must have at least one item."),
});

const updateOrderSchema = z.object({
    employeeId: z.int(),
    orderItems: z.array(
        z.object({
            productId: z.int(),
            quantity: z.int().positive(),
        })
    ).min(1, "The order must have at least one item."),
});

const updateOrderStatusSchema = z.object({
    status: z.enum(["PENDING", "PAID", "CANCELLED", "COMPLETED"]),
    employeeId: z.int()
});

export const listOrders = async (req: Request, res: Response) => {
    const orders = await prisma.orders.findMany({
        include: {
            orderItems: true,
            customer: true,
            employee: true
        }
    });
    res.status(200).json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
    const foundOrder = await prisma.orders.findUnique({
        where: {
            id: Number(req.params.id)
        },
        include: {
            orderItems: true,
            customer: true,
            employee: true
        }
    });

    if (foundOrder) {
        res.status(200).json(foundOrder);
    }
    else {
        res.status(404).json("Order not found");
    };
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const validatedData = createOrderSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {

            const products: {
                product: { id: number; price: any };
                quantity: number
            }[] = [];

            for (const item of validatedData.orderItems) {
                const product = await tx.products.findUnique({
                    where: {
                        id: item.productId
                    }
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                products.push({
                    product,
                    quantity: item.quantity
                });
            };

            const totalValue = products.reduce<number>(
                (total, current) => {
                    return total + Number(current.product.price) * current.quantity;
                },
                0
            );

            const newOrder = await tx.orders.create({
                data: {
                    customerId: validatedData.customerId,
                    employeeId: validatedData.employeeId,
                    totalValue: totalValue,
                }
            });

            for (const item of products) {
                await tx.orderItems.create({
                    data: {
                        orderId: newOrder.id,
                        quantity: item.quantity,
                        productId: item.product.id,
                        unitPrice: item.product.price,
                    }
                });
            };

            return newOrder;
        });

        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: "Error in processing order" });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const validatedData = updateOrderSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {

            const foundOrder = await tx.orders.findUnique({
                where: {
                    id: Number(req.params.id)
                }
            });

            if (!foundOrder) {
                throw new Error("Order not found");
            };

            if (foundOrder?.status !== "PENDING") {
                throw new Error("Cannot update order: the order has already been paid")
            };

            await tx.orderItems.deleteMany({
                where: {
                    orderId: foundOrder.id
                }
            })

            const products: {
                product: { id: number; price: any };
                quantity: number
            }[] = [];

            for (const item of validatedData.orderItems) {
                const product = await tx.products.findUnique({
                    where: {
                        id: item.productId
                    }
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                products.push({
                    product,
                    quantity: item.quantity
                });
            };

            const totalValue = products.reduce<number>(
                (total, current) => {
                    return total + Number(current.product.price) * current.quantity;
                },
                0
            );

            const updatedOrder = await tx.orders.update({
                where: {
                    id: foundOrder.id
                },
                data: {
                    customerId: foundOrder.customerId,
                    employeeId: validatedData.employeeId,
                    totalValue: totalValue,
                }
            });

            for (const item of products) {
                await tx.orderItems.create({
                    data: {
                        orderId: updatedOrder.id,
                        quantity: item.quantity,
                        productId: item.product.id,
                        unitPrice: item.product.price,
                    }
                });
            };

            return updatedOrder;
        });

        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: "Error in updating order" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const validatedData = updateOrderStatusSchema.parse(req.body)
        const orderId = Number(req.params.id);

        const result = await prisma.$transaction(async (tx) => {

            const order = await tx.orders.findUnique({
                where: {
                    id: orderId
                }
            })

            if (!order) {
                throw new Error("Order not found");
            }
            
            if (order.status === "CANCELLED" || order.status === "COMPLETED") {
                throw new Error("This order can no longer be updated");
            }
            
            if (validatedData.status === "PAID" && order.status !== "PENDING") {
                throw new Error("Only pending orders can be paid");
            }

            if (validatedData.status === "COMPLETED" && order.status !== "PAID") {
                throw new Error("Only paid orders can be completed");
            }

            const orderItems = await tx.orderItems.findMany({
                where: {
                    orderId: orderId
                }
            });
            
            const newStatus = await tx.orders.update({
                where: {
                    id: orderId
                },
                data: {
                    status: validatedData.status,
                    completedAt: validatedData.status === "COMPLETED"
                        ? new Date()
                        : undefined,
                }
            });
            
            if (validatedData.status === "PAID" && order.status === "PENDING") {
                for (const item of orderItems) {
                    await tx.transactions.create({
                        data: {
                            quantity: item.quantity,
                            type: "OUTFLOW",
                            reason: "SALE",
                            productId: item.productId,
                            employeeId: validatedData.employeeId,
                            orderId: orderId
                        }
                    });
                };
            };

            if (validatedData.status === "CANCELLED" && order.status === "PAID") {
                for (const item of orderItems) {
                    await tx.transactions.create({
                        data: {
                            quantity: item.quantity,
                            type: "INFLOW",
                            reason: "RETURN",
                            productId: item.productId,
                            employeeId: validatedData.employeeId,
                            orderId: orderId
                        }
                    });
                };
            };
            return newStatus;
        });

        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: "Error in updating order status" });
    }
};