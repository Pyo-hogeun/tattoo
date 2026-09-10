import { Router } from 'express';
import { createInteraction, deleteInteraction, deleteInteractionByTarget, listInteractions } from '../controllers/interactionController.js';
import { authenticateCustomer } from '../middleware/customerAuth.js';

const router = Router();
router.use(authenticateCustomer);
router.get('/', listInteractions);
router.post('/', createInteraction);
router.delete('/', deleteInteractionByTarget);
router.delete('/:id', deleteInteraction);
export default router;
