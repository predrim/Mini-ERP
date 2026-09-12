import { Router } from 'express';
import { listCustomers, deleteCustomer,
         getCustomerById, createCustomer,
         updateCustomer } from "../controllers/customers.controller"; 
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get('/', listCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;