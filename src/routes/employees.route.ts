import { Router } from 'express';
import { listEmployees, deleteEmployee,
         getEmployeeById, createEmployee,
         updateEmployee } from "../controllers/employees.controller"; 
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get('/', listEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;