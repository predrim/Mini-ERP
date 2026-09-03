import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import categoryRoutes from './routes/categories.routes';
import productRoutes from './routes/products.routes';
import customerRoutes from './routes/customers.routes';
import employeeRoutes from './routes/employees.route';
import transactionRoutes from './routes/transactions.routes';
import orderRoutes from './routes/orders.routes';
import authRoutes from './routes/auth.routes';
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/employees', employeeRoutes);
app.use('/transactions', transactionRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);

app.listen(
    PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
);