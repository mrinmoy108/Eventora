import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendBookingMessage = async (req: Request, res: Response) => {
  const { id } = req.params; // booking_id
  const { content } = req.body;
  const senderId = (req as any).user.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Determine receiver
    let receiverId: number;
    if (senderId === booking.organizer_id) {
      // Receiver is the professional
      const professional = await prisma.professional.findUnique({
        where: { id: booking.professional_id }
      });
      if (!professional) {
        return res.status(404).json({ error: 'Professional not found for booking' });
      }
      receiverId = professional.user_id;
    } else {
      // Sender must be professional
      const professional = await prisma.professional.findUnique({
        where: { id: booking.professional_id }
      });
      if (!professional || professional.user_id !== senderId) {
        return res.status(403).json({ error: 'Unauthorized to send message for this booking' });
      }
      receiverId = booking.organizer_id;
    }

    const message = await prisma.message.create({
      data: {
        booking_id: Number(id),
        sender_id: senderId,
        receiver_id: receiverId,
        content
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getBookingMessages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        professional: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ensure user is organizer, professional, or admin
    const isAdmin = (req as any).user.role === 'admin';
    const isOrganizer = booking.organizer_id === userId;
    const isProfessional = booking.professional?.user_id === userId;

    if (!isAdmin && !isOrganizer && !isProfessional) {
      return res.status(403).json({ error: 'Unauthorized to view messages for this booking' });
    }

    const messages = await prisma.message.findMany({
      where: { booking_id: Number(id) },
      include: {
        sender: { select: { id: true, full_name: true, role: true } },
        receiver: { select: { id: true, full_name: true, role: true } }
      },
      orderBy: { created_at: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
