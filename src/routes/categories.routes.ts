import { Router } from 'express';
import { listCategories, deleteCategory,
         getCategoryById, makeCategory,
         updateCategory} from "../controllers/categories.controller"; 

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategoryById);
router.post('/', makeCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;