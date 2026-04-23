import { Router } from 'express';
import { createSource, deleteSource, listSources, updateSource } from '../controllers/sourceController.js';

const router = Router();

router.get('/', listSources);
router.post('/', createSource);
router.put('/:id', updateSource);
router.delete('/:id', deleteSource);

export default router;
