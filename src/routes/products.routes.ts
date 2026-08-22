import { Router } from 'express';
import { listProducts, deleteProduct,
         getProductById, createProduct,
         updateProduct } from "../controllers/products.controller"; 

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;