import { Router } from 'express';
import {
  startChat,
  sendMessage,
  getChat,
  getChatHistory,
  deleteChat,
  rateMessage
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/start', authenticate, startChat);
router.post('/message', authenticate, sendMessage);
router.get('/history', authenticate, getChatHistory);
router.get('/:id', authenticate, getChat);
router.delete('/:id', authenticate, deleteChat);
router.post('/rate', authenticate, rateMessage);

export default router;