import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { organizerId, professionalId, eventId, packageId, message, eventDate } = req.body;

    if (!organizerId || !professionalId || !eventId || !eventDate) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer_id !== Number(organizerId)) {
      return res.status(403).json({ error: 'Unauthorized: Event does not belong to this organizer' });
    }

    // Verify professional exists
    const professional = await prisma.professional.findUnique({
      where: { id: Number(professionalId) }
    });

    if (!professional) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }

    // Fetch agreed price if package is selected
    let agreedPrice = null;
    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: Number(packageId) }
      });
      if (pkg) {
        agreedPrice = pkg.price;
      }
    }

    const booking = await prisma.booking.create({
      data: {
        organizer_id: Number(organizerId),
        professional_id: Number(professionalId),
        event_id: Number(eventId),
        package_id: packageId ? Number(packageId) : null,
        message: message || '',
        event_date: new Date(eventDate),
        agreed_price: agreedPrice,
        status: 'pending',
        payment_status: 'unpaid'
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating professional booking:', error);
    res.status(500).json({ error: 'Failed to create professional booking' });
  }
};

export const getOrganizerBookings = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) {
      return res.status(400).json({ error: 'Organizer ID is required' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        organizer_id: Number(organizerId)
      },
      include: {
        event: {
          select: {
            title: true,
            start_datetime: true
          }
        },
        package: {
          select: {
            name: true,
            price: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                full_name: true,
                email: true,
                avatar_url: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching organizer bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getProfessionalBookings = async (req: Request, res: Response) => {
  try {
    const { professionalId } = req.query;
    if (!professionalId) {
      return res.status(400).json({ error: 'Professional ID is required' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        professional_id: Number(professionalId)
      },
      include: {
        event: {
          select: {
            title: true,
            start_datetime: true
          }
        },
        package: {
          select: {
            name: true,
            price: true
          }
        },
        organizer: {
          select: {
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching professional bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        event: true,
        package: true,
        professional: true
      }
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking by id:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

export const payBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { payment_status: 'paid' }
    });

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error paying booking:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

