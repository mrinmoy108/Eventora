import { Router } from 'express';
import { createOrder, processPayment, getOrder, getAttendeeOrders, getAttendeeTickets, getTicketDetails } from '../controllers/order.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createOrder);
router.get('/', getAttendeeOrders);
router.get('/user/tickets', getAttendeeTickets);
router.get('/tickets/:ticketId', getTicketDetails);
router.get('/:orderId', getOrder);
router.post('/:orderId/pay', processPayment);

export default router;

