import { Router } from 'express';
import { listCategories, deleteCategory,
         getCategoryById, createCategory,
         updateCategory } from "../controllers/categories.controller"; 
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get('/', listCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;