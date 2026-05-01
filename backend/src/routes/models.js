import { Router } from 'express';
import { getOpenRouterModels, getOllamaModels } from '../controllers/modelsController.js';

const router = Router();

router.get('/openrouter', getOpenRouterModels);
router.get('/ollama', getOllamaModels);

export default router;