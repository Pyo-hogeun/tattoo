import { Router } from 'express';
import { createBrowShape, deleteBrowShape, listBrowShapes, updateBrowShape } from '../controllers/browShapeController.js';
import { multipartFormData } from '../middleware/multipart.js';

const router = Router();

router.get('/', listBrowShapes);
router.post('/', multipartFormData, createBrowShape);
router.put('/:id', multipartFormData, updateBrowShape);
router.delete('/:id', deleteBrowShape);

export default router;
