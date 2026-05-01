import { Router } from 'express';
import {
  getCharacters,
  getCharacterById,
  getMyCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../controllers/characterController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getCharacters);
router.get('/my', authenticate, getMyCharacters);
router.get('/:id', authenticate, getCharacterById);
router.post('/', authenticate, createCharacter);
router.put('/:id', authenticate, updateCharacter);
router.delete('/:id', authenticate, deleteCharacter);

export default router;