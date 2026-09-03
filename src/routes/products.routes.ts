import { Router } from 'express';
import { listProducts, deleteProduct,
         getProductById, createProduct,
         updateProduct } from "../controllers/products.controller"; 
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;