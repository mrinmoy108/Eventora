import { Router } from 'express';
import { createBooking, getOrganizerBookings, getProfessionalBookings, updateBookingStatus, payBooking, getBookingById } from '../controllers/booking.controller';

const router = Router();

router.post('/', createBooking);
router.get('/', getOrganizerBookings);
router.get('/professional', getProfessionalBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/pay', payBooking);

export default router;

