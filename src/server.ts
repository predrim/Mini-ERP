import 'dotenv/config'
import express from 'express';
import categoryRoutes from './routes/categories.routes';
const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/categories', categoryRoutes);

app.listen(
    PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
);