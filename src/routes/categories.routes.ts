import { Router } from 'express';
import { listCategories, deleteCategory,
         getCategoryById, createCategory,
         updateCategory } from "../controllers/categories.controller"; 

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;