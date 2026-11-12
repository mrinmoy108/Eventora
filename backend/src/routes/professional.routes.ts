import { Router } from 'express';
import { 
  getProfessionals, 
  getProfessionalById, 
  getProfessionalByUserId, 
  updateProfessionalProfile 
} from '../controllers/professional.controller';

const router = Router();

router.get('/', getProfessionals);
router.get('/user/:userId', getProfessionalByUserId);
router.put('/user/:userId', updateProfessionalProfile);
router.get('/:id', getProfessionalById);

export default router;
