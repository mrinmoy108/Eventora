import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getBookingMessages, sendBookingMessage } from '../controllers/booking-chat.controller';

const router = Router();

router.use(authenticateToken);

router.get('/:id/messages', getBookingMessages);
router.post('/:id/messages', sendBookingMessage);

export default router;
