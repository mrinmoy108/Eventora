import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { 
  getDashboardStats, 
  getUsers, 
  getEvents, 
  getProfessionals, 
  updateProfessional, 
  deleteProfessional,
  getBookings,
  updateUser,
  getBookingMessages,
  resolveDispute,
  getReviews,
  moderateReview,
  deleteReview,
  getTransactions,
  refundOrder,
  getPlatformSettings,
  updatePlatformSettings,
  getPayouts,
  updatePayoutStatus
} from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes with auth and role=admin
router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/events', getEvents);
router.get('/professionals', getProfessionals);
router.put('/professionals/:id', updateProfessional);
router.delete('/professionals/:id', deleteProfessional);

// Booking Disputes
router.get('/bookings', getBookings);
router.get('/bookings/:id/messages', getBookingMessages);
router.put('/bookings/:id/resolve-dispute', resolveDispute);

// Review Moderation
router.get('/reviews', getReviews);
router.put('/reviews/:id/moderate', moderateReview);
router.delete('/reviews/:id', deleteReview);

// Payments & Payouts & Settings
router.get('/payments/transactions', getTransactions);
router.post('/payments/orders/:id/refund', refundOrder);
router.get('/payouts', getPayouts);
router.put('/payouts/:id', updatePayoutStatus);
router.get('/settings', getPlatformSettings);
router.post('/settings', updatePlatformSettings);



export default router;
