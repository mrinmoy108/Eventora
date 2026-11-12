import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { eventId, attendeeId, items } = req.body;
    // items: [{ ticketTierId: number, quantity: number, price: number }]

    if (!eventId || !attendeeId || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        event_id: eventId,
        attendee_id: attendeeId,
        subtotal: subtotal,
        total_amount: subtotal, // skipping taxes/fees for now
        payment_status: 'pending',
        order_items: {
          create: items.map((item: any) => ({
            ticket_tier_id: item.ticketTierId,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity
          }))
        }
      },
      include: {
        order_items: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body; // e.g. bkash, card

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { order_items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status to paid
    await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        payment_status: 'paid',
        payment_method: paymentMethod as any
      }
    });

    // Create tickets
    const ticketsToCreate = [];
    for (const item of order.order_items) {
      for (let i = 0; i < item.quantity; i++) {
        ticketsToCreate.push({
          order_item_id: item.id,
          attendee_id: order.attendee_id,
          event_id: order.event_id,
          ticket_tier_id: item.ticket_tier_id,
          qr_code_token: `TKT-${order.id}-${item.id}-${i}-${Date.now()}`
        });
      }
    }

    if (ticketsToCreate.length > 0) {
      await prisma.ticket.createMany({
        data: ticketsToCreate
      });
    }

    res.status(200).json({ message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const getAttendeeOrders = async (req: Request, res: Response) => {
  try {
    const attendeeId = req.query.attendeeId;
    if (!attendeeId) {
      return res.status(400).json({ error: 'Attendee ID is required' });
    }
    const orders = await prisma.order.findMany({
      where: {
        attendee_id: Number(attendeeId)
      },
      include: {
        event: {
          select: {
            title: true,
            start_datetime: true,
            venue_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching attendee orders:', error);
    res.status(500).json({ error: 'Failed to fetch attendee orders' });
  }
};

export const getAttendeeTickets = async (req: Request, res: Response) => {
  try {
    const attendeeId = req.query.attendeeId;
    if (!attendeeId) {
      return res.status(400).json({ error: 'Attendee ID is required' });
    }
    const tickets = await prisma.ticket.findMany({
      where: {
        attendee_id: Number(attendeeId)
      },
      include: {
        event: {
          select: {
            title: true,
            start_datetime: true,
            venue_name: true,
            cover_image_url: true
          }
        },
        ticket_tier: {
          select: {
            name: true,
            price: true
          }
        }
      }
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching attendee tickets:', error);
    res.status(500).json({ error: 'Failed to fetch attendee tickets' });
  }
};

export const getTicketDetails = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: Number(ticketId)
      },
      include: {
        event: {
          select: {
            title: true,
            start_datetime: true,
            venue_name: true,
            address: true,
            city: true,
            country: true,
            cover_image_url: true
          }
        },
        ticket_tier: {
          select: {
            name: true,
            price: true
          }
        },
        attendee: {
          select: {
            full_name: true,
            email: true
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
};



