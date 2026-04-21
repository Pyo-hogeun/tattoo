import { Router } from 'express';
import { createShop, deleteShop, listShops, updateShop } from '../controllers/shopController.js';

const router = Router();

router.get('/', listShops);
router.post('/', createShop);
router.put('/:id', updateShop);
router.delete('/:id', deleteShop);

export default router;
