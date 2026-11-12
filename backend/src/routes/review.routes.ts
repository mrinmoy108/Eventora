import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createReview, getProfessionalReviews } from '../controllers/review.controller';

const router = Router();

router.post('/', authenticateToken, createReview);
router.get('/professional/:id', getProfessionalReviews);

export default router;
