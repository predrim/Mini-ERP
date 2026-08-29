export const calculateProductStock = async (productId: number, db: any) => {
    const foundProduct = await db.products.findUnique({
        where: {
            id: productId,
        }
    });
    if (!foundProduct) {
        throw new Error("Product not found");
    };

    const transactions = await db.transactions.findMany({
        where: {
            productId
        }
    });

    let stockCount: number = 0;

    for (const transaction of transactions) {
        if (transaction.type === "INFLOW") {
            stockCount += transaction.quantity;
        }
        else if (transaction.type === "OUTFLOW") {
            stockCount -= transaction.quantity;
        }
    };

    return stockCount;
};