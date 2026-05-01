import { Router } from 'express';
import { getLLMSettings, updateLLMSettings } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/llm', authenticate, getLLMSettings);
router.post('/llm', authenticate, updateLLMSettings);

export default router;