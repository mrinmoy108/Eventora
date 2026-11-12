import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalBookings = await prisma.booking.count();
    
    // Calculate total revenue from tickets and bookings
    const ordersResult = await prisma.order.aggregate({
      _sum: { total_amount: true },
      where: { payment_status: 'paid' }
    });
    
    const bookingsResult = await prisma.booking.aggregate({
      _sum: { agreed_price: true },
      where: { payment_status: 'paid' }
    });

    const totalRevenue = 
      (ordersResult._sum.total_amount ? Number(ordersResult._sum.total_amount) : 0) +
      (bookingsResult._sum.agreed_price ? Number(bookingsResult._sum.agreed_price) : 0);

    // Get recently added professionals
    const recentProfessionals = await prisma.professional.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { user: { select: { full_name: true, email: true } } }
    });

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      recentProfessionals
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        phone: true,
        is_verified: true,
        created_at: true,
        is_active: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: { select: { full_name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getProfessionals = async (req: Request, res: Response) => {
  try {
    const professionals = await prisma.professional.findMany({
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            is_active: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ error: 'Failed to fetch professionals' });
  }
};

export const updateProfessional = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    is_approved, 
    base_price, 
    city,
    pro_type,
    bio,
    country,
    price_unit,
    years_exp,
    is_available
  } = req.body;
  try {
    const professional = await prisma.professional.update({
      where: { id: Number(id) },
      data: {
        is_approved: is_approved !== undefined ? Boolean(is_approved) : undefined,
        base_price: base_price !== undefined ? Number(base_price) : undefined,
        city: city !== undefined ? city : undefined,
        pro_type: pro_type !== undefined ? pro_type : undefined,
        bio: bio !== undefined ? bio : undefined,
        country: country !== undefined ? country : undefined,
        price_unit: price_unit !== undefined ? price_unit : undefined,
        years_exp: years_exp !== undefined ? Number(years_exp) : undefined,
        is_available: is_available !== undefined ? Boolean(is_available) : undefined,
      }
    });
    res.json(professional);
  } catch (error) {
    console.error('Error updating professional:', error);
    res.status(500).json({ error: 'Failed to update professional' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, email, role, phone, is_active, is_verified } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        full_name: full_name !== undefined ? full_name : undefined,
        email: email !== undefined ? email : undefined,
        role: role !== undefined ? role : undefined,
        phone: phone !== undefined ? phone : undefined,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined,
        is_verified: is_verified !== undefined ? Boolean(is_verified) : undefined,
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};


export const deleteProfessional = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.professional.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Professional deleted successfully' });
  } catch (error) {
    console.error('Error deleting professional:', error);
    res.status(500).json({ error: 'Failed to delete professional' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        organizer: { select: { full_name: true, email: true } },
        professional: {
          include: {
            user: { select: { full_name: true } }
          }
        },
        event: { select: { title: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingMessages = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
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
    console.error('Error fetching booking messages:', error);
    res.status(500).json({ error: 'Failed to fetch booking messages' });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, payment_status, agreed_price } = req.body;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) }
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedPrice = agreed_price !== undefined ? Number(agreed_price) : Number(booking.agreed_price || 0);

    // Fetch commission percent from platform settings
    const commissionSetting = await prisma.platformSetting.findUnique({
      where: { setting_key: 'platform_commission_percent' }
    });
    const commissionPercent = commissionSetting ? Number(commissionSetting.setting_value) : 5.0;

    const platform_fee = (updatedPrice * commissionPercent) / 100.0;
    const net_payout = updatedPrice - platform_fee;

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        status: status || undefined,
        payment_status: payment_status || undefined,
        agreed_price: agreed_price !== undefined ? updatedPrice : undefined,
        platform_fee: agreed_price !== undefined ? platform_fee : undefined,
        net_payout: agreed_price !== undefined ? net_payout : undefined,
        completed_at: status === 'completed' ? new Date() : undefined
      }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: { select: { id: true, full_name: true, email: true } },
        event: { select: { id: true, title: true } },
        professional: { include: { user: { select: { id: true, full_name: true } } } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const moderateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_flagged, warn_reviewer } = req.body;
  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(id) }
    });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (warn_reviewer) {
      // Warn reviewer: create a notification
      await prisma.notification.create({
        data: {
          user_id: review.reviewer_id,
          type: 'warning',
          title: 'Account Warning: Inappropriate Content',
          body: 'Your review comment has been flagged and moderated. Please respect our guidelines when posting reviews.',
          link: '/dashboard/attendee/reviews'
        }
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        is_flagged: is_flagged !== undefined ? Boolean(is_flagged) : undefined
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({ error: 'Failed to moderate review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.review.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    // Fetch all orders
    const orders = await prisma.order.findMany({
      include: {
        attendee: { select: { full_name: true, email: true } },
        event: { select: { title: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    // Fetch all booking payments
    const bookings = await prisma.booking.findMany({
      include: {
        organizer: { select: { full_name: true, email: true } },
        professional: { include: { user: { select: { full_name: true } } } },
        event: { select: { title: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ orders, bookings });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const refundOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const refundValue = amount !== undefined ? Number(amount) : Number(order.total_amount);

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        payment_status: refundValue >= Number(order.total_amount) ? 'refunded' : 'partial_refund',
        refunded_amount: Number(order.refunded_amount) + refundValue
      }
    });

    // Also update associated tickets status to refunded/cancelled if fully refunded
    if (updatedOrder.payment_status === 'refunded') {
      await prisma.ticket.updateMany({
        where: { order_item: { order_id: Number(id) } },
        data: { status: 'refunded', cancelled_at: new Date() }
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error refunding order:', error);
    res.status(500).json({ error: 'Failed to refund order' });
  }
};

export const getPlatformSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.platformSetting.findMany();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updatePlatformSettings = async (req: Request, res: Response) => {
  const { settings } = req.body; // array of { setting_key, setting_value }
  try {
    for (const s of settings) {
      await prisma.platformSetting.upsert({
        where: { setting_key: s.setting_key },
        update: { setting_value: s.setting_value },
        create: { setting_key: s.setting_key, setting_value: s.setting_value }
      });
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getPayouts = async (req: Request, res: Response) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        recipient: { select: { full_name: true, email: true, role: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(payouts);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
};

export const updatePayoutStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, transaction_ref } = req.body;
  try {
    const payout = await prisma.payout.update({
      where: { id: Number(id) },
      data: {
        status,
        transaction_ref: transaction_ref || undefined,
        processed_at: status === 'completed' ? new Date() : undefined
      }
    });

    if (payout.status === 'completed' && payout.reference_type === 'booking') {
      await prisma.booking.updateMany({
        where: { id: payout.reference_id },
        data: { payment_status: 'payout_done' }
      });
    }

    res.json(payout);
  } catch (error) {
    console.error('Error updating payout status:', error);
    res.status(500).json({ error: 'Failed to update payout status' });
  }
};

