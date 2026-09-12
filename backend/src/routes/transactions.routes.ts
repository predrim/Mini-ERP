import { Router } from 'express';
import { listTransactions } from "../controllers/transactions.controller"; 
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get('/', listTransactions);

export default router;