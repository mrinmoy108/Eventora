import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReview = async (req: Request, res: Response) => {
  try {
    const { reviewee_type, professional_id, event_id, booking_id, rating, comment } = req.body;
    const reviewer_id = (req as any).user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await prisma.review.create({
      data: {
        reviewer_id,
        reviewee_type,
        professional_id: professional_id ? Number(professional_id) : null,
        event_id: event_id ? Number(event_id) : null,
        booking_id: booking_id ? Number(booking_id) : null,
        rating: Number(rating),
        comment
      }
    });

    // Update the professional's average rating and review count
    if (reviewee_type === 'professional' && professional_id) {
      const allReviews = await prisma.review.findMany({
        where: { professional_id: Number(professional_id) }
      });
      const avg_rating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      
      await prisma.professional.update({
        where: { id: Number(professional_id) },
        data: {
          avg_rating: avg_rating,
          review_count: allReviews.length
        }
      });
    }

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

export const getProfessionalReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { professional_id: Number(id) },
      include: {
        reviewer: {
          select: { full_name: true, avatar_url: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching professional reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
