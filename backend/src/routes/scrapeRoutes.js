import { Router } from 'express';
import { recentRuns, runScraping } from '../controllers/scrapeController.js';

const router = Router();

router.post('/run', runScraping);
router.get('/runs', recentRuns);

export default router;
