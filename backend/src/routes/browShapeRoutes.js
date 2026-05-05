import { Router } from 'express';
import { createBrowShape, deleteBrowShape, listBrowShapes, updateBrowShape } from '../controllers/browShapeController.js';

const router = Router();

router.get('/', listBrowShapes);
router.post('/', createBrowShape);
router.put('/:id', updateBrowShape);
router.delete('/:id', deleteBrowShape);

export default router;
