import express from 'express';
import {
  getConversations,
  getMessages,
  startConversation,
  sendMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/start', startConversation);
router.post('/send', sendMessage);

export default router;
