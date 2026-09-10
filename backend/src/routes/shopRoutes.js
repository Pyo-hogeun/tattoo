import { Router } from 'express';
import { createShop, deleteShop, listShops, updateShop } from '../controllers/shopController.js';
import { allowRoles, authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', allowRoles('admin', 'master'), listShops);
router.post('/', allowRoles('master'), createShop);
router.put('/:id', allowRoles('admin', 'master'), updateShop);
router.delete('/:id', allowRoles('master'), deleteShop);

export default router;
