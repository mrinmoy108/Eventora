import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';


export const getEvents = async (req: Request, res: Response) => {
  try {
    const { organizerId, search, city, category } = req.query;
    const where: any = {};

    if (organizerId) {
      where.organizer_id = Number(organizerId);
    } else {
      where.status = 'published';
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } }
      ];
    }

    if (city) {
      where.city = { contains: String(city) };
    }

    if (category && category !== 'All Categories') {
      where.category = {
        name: { equals: String(category) }
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        organizer: {
          select: {
            full_name: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        start_datetime: 'asc'
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
          }
        },
        ticket_tiers: true,
        gallery: true,
        faqs: true,
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      categoryId,
      organizerId,
      short_desc,
      description,
      event_type,
      venue_name,
      address,
      city,
      country,
      start_datetime,
      end_datetime,
      cover_image_url,
      total_capacity,
      ticket_tiers,
      gallery
    } = req.body;

    if (!title || !categoryId || !organizerId || !start_datetime || !end_datetime) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        category_id: Number(categoryId),
        organizer_id: Number(organizerId),
        short_desc: short_desc || '',
        description: description || '',
        event_type: event_type || 'in_person',
        venue_name: venue_name || '',
        address: address || '',
        city: city || '',
        country: country || 'Bangladesh',
        start_datetime: new Date(start_datetime),
        end_datetime: new Date(end_datetime),
        cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        total_capacity: total_capacity ? Number(total_capacity) : null,
        status: 'published',
        ticket_tiers: ticket_tiers && ticket_tiers.length > 0 ? {
          create: ticket_tiers.map((tier: any) => ({
            name: tier.name,
            price: Number(tier.price),
            quantity_total: Number(tier.quantity_total),
            quantity_sold: 0
          }))
        } : undefined,
        gallery: gallery && gallery.length > 0 ? {
          create: gallery.map((url: string, index: number) => ({
            image_url: url,
            display_order: index
          }))
        } : undefined
      },
      include: {
        ticket_tiers: true,
        gallery: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getOrganizerStats = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({ error: 'Organizer ID is required' });
    }

    const orgId = Number(organizerId);

    const totalEvents = await prisma.event.count({
      where: { organizer_id: orgId }
    });

    const ticketsSold = await prisma.ticket.count({
      where: {
        event: {
          organizer_id: orgId
        }
      }
    });

    const ordersSum = await prisma.order.aggregate({
      _sum: {
        total_amount: true
      },
      where: {
        payment_status: 'paid',
        event: {
          organizer_id: orgId
        }
      }
    });

    const revenue = Number(ordersSum._sum.total_amount || 0);

    const pendingTeam = await prisma.booking.count({
      where: {
        organizer_id: orgId,
        status: 'pending'
      }
    });

    res.json({
      totalEvents,
      ticketsSold,
      revenue,
      pendingTeam
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    res.status(500).json({ error: 'Failed to fetch organizer stats' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        ticket_tiers: true,
        gallery: true,
        faqs: true,
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event by id:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      title,
      categoryId,
      organizerId,
      short_desc,
      description,
      event_type,
      venue_name,
      address,
      city,
      country,
      start_datetime,
      end_datetime,
      cover_image_url,
      total_capacity,
      ticket_tiers,
      gallery
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Check ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if editing by Admin (via token)
    let isEditingByAdmin = false;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const verified = jwt.verify(token, JWT_SECRET) as any;
        if (verified && verified.role === 'admin') {
          isEditingByAdmin = true;
        }
      } catch (err) {
        // Ignore token verification error and fallback to regular organizer check
      }
    }

    if (!isEditingByAdmin && existingEvent.organizer_id !== Number(organizerId)) {
      return res.status(403).json({ error: 'You are not authorized to update this event' });
    }


    // Prepare slug if title changed
    let slug = existingEvent.slug;
    if (title && title !== existingEvent.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now();
    }

    // Update main event details
    await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        category_id: categoryId ? Number(categoryId) : undefined,
        short_desc: short_desc !== undefined ? short_desc : undefined,
        description: description !== undefined ? description : undefined,
        event_type: event_type || undefined,
        venue_name: venue_name !== undefined ? venue_name : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        country: country !== undefined ? country : undefined,
        start_datetime: start_datetime ? new Date(start_datetime) : undefined,
        end_datetime: end_datetime ? new Date(end_datetime) : undefined,
        cover_image_url: cover_image_url !== undefined ? cover_image_url : undefined,
        total_capacity: total_capacity !== undefined ? (total_capacity ? Number(total_capacity) : null) : undefined,
      }
    });

    // Handle ticket tiers updates
    if (ticket_tiers) {
      const existingTiers = await prisma.ticketTier.findMany({
        where: { event_id: id }
      });
      const inputTierIds = ticket_tiers.map((t: any) => t.id).filter(Boolean);

      // Deletes tiers not in input list
      const tiersToDelete = existingTiers.filter(t => !inputTierIds.includes(t.id));
      for (const tier of tiersToDelete) {
        try {
          await prisma.ticketTier.delete({ where: { id: tier.id } });
        } catch (err) {
          // Fallback: if tickets already sold, set active to false
          await prisma.ticketTier.update({
            where: { id: tier.id },
            data: { is_active: false }
          });
        }
      }

      // Update / Create input tiers
      for (const tier of ticket_tiers) {
        if (tier.id) {
          await prisma.ticketTier.update({
            where: { id: Number(tier.id) },
            data: {
              name: tier.name,
              price: Number(tier.price),
              quantity_total: Number(tier.quantity_total)
            }
          });
        } else {
          await prisma.ticketTier.create({
            data: {
              event_id: id,
              name: tier.name,
              price: Number(tier.price),
              quantity_total: Number(tier.quantity_total),
              quantity_sold: 0
            }
          });
        }
      }
    }

    // Handle Event Gallery updates
    if (gallery !== undefined) {
      await prisma.eventGallery.deleteMany({
        where: { event_id: id }
      });

      if (gallery && gallery.length > 0) {
        await prisma.eventGallery.createMany({
          data: gallery.map((url: string, index: number) => ({
            event_id: id,
            image_url: url,
            display_order: index
          }))
        });
      }
    }

    // Return the complete updated event
    const updatedEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        ticket_tiers: true,
        gallery: true
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { organizerId } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership if organizerId is provided
    if (organizerId && event.organizer_id !== Number(organizerId)) {
      return res.status(403).json({ error: 'You are not authorized to delete this event' });
    }

    // Delete event
    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event. This event has registered attendees, ticket sales, or active professional bookings.' });
  }
};

