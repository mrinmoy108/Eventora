import { Router } from 'express';
import { 
  getEvents, 
  getEventBySlug, 
  createEvent, 
  getCategories, 
  getOrganizerStats,
  getEventById,
  updateEvent,
  deleteEvent 
} from '../controllers/event.controller';

const router = Router();

// Categories and stats (distinct routes before dynamic slug route)
router.get('/meta/categories', getCategories);
router.get('/organizer/stats', getOrganizerStats);
router.get('/id/:id', getEventById);

// Event CRUD
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// Public routes
router.get('/', getEvents);
router.get('/:slug', getEventBySlug);

export default router;

