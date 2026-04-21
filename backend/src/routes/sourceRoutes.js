import { Router } from 'express';
import { createSource, listSources, updateSource } from '../controllers/sourceController.js';

const router = Router();

router.get('/', listSources);
router.post('/', createSource);
router.put('/:id', updateSource);

export default router;
