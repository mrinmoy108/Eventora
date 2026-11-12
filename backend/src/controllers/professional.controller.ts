import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfessionals = async (req: Request, res: Response) => {
  try {
    const { type, city, specialty, minPrice, maxPrice, search } = req.query;

    const where: any = {
      is_approved: true
    };

    if (type) {
      if (type === 'photographers_videographers') {
        where.pro_type = {
          in: ['photographer', 'videographer', 'photographer_videographer']
        };
      } else {
        where.pro_type = type;
      }
    }

    if (city) {
      where.city = { contains: String(city) };
    }

    if (specialty) {
      where.specialties = {
        some: {
          specialty: { contains: String(specialty) }
        }
      };
    }

    if (minPrice || maxPrice) {
      where.base_price = {};
      if (minPrice) {
        where.base_price.gte = Number(minPrice);
      }
      if (maxPrice) {
        where.base_price.lte = Number(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        { user: { full_name: { contains: String(search) } } },
        { bio: { contains: String(search) } }
      ];
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true
          }
        },
        specialties: true,
        packages: {
          where: { is_active: true }
        }
      },
      orderBy: {
        avg_rating: 'desc'
      }
    });

    res.status(200).json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ error: 'Failed to fetch professionals' });
  }
};

export const getProfessionalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const professional = await prisma.professional.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true
          }
        },
        specialties: true,
        packages: {
          where: { is_active: true }
        },
        portfolio: {
          orderBy: { display_order: 'asc' }
        },
        reviews: {
          orderBy: { created_at: 'desc' },
          include: {
            reviewer: {
              select: {
                full_name: true,
                avatar_url: true
              }
            }
          }
        }
      }
    });

    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    res.status(200).json(professional);
  } catch (error) {
    console.error('Error fetching professional profile:', error);
    res.status(500).json({ error: 'Failed to fetch professional profile' });
  }
};

export const getProfessionalByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    let professional = await prisma.professional.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true
          }
        },
        specialties: true,
        packages: {
          where: { is_active: true }
        },
        portfolio: {
          orderBy: { display_order: 'asc' }
        },
        reviews: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!professional) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let proType: any = 'photographer';
      if (user.role === 'event_manager') {
        proType = 'event_manager';
      }

      const newProfessional = await prisma.professional.create({
        data: {
          user_id: userId,
          pro_type: proType,
          city: 'Dhaka',
          country: 'Bangladesh',
          is_approved: true,
          base_price: 1000,
        },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              avatar_url: true
            }
          },
          specialties: true,
          packages: true,
          portfolio: true,
          reviews: true
        }
      });
      professional = newProfessional;
    }

    res.status(200).json(professional);
  } catch (error) {
    console.error('Error fetching professional by user id:', error);
    res.status(500).json({ error: 'Failed to fetch professional profile' });
  }
};

export const updateProfessionalProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const {
      bio,
      city,
      country,
      base_price,
      price_unit,
      years_exp,
      specialties,
      portfolio,
    } = req.body;

    let professional = await prisma.professional.findUnique({
      where: { user_id: userId }
    });

    if (!professional) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }

    const updated = await prisma.professional.update({
      where: { user_id: userId },
      data: {
        bio: bio !== undefined ? bio : undefined,
        city: city !== undefined ? city : undefined,
        country: country !== undefined ? country : undefined,
        base_price: base_price !== undefined ? Number(base_price) : undefined,
        price_unit: price_unit || undefined,
        years_exp: years_exp !== undefined ? Number(years_exp) : undefined,
      }
    });

    if (specialties !== undefined) {
      await prisma.professionalSpecialty.deleteMany({
        where: { professional_id: updated.id }
      });
      if (specialties && specialties.length > 0) {
        await prisma.professionalSpecialty.createMany({
          data: specialties.map((spec: string) => ({
            professional_id: updated.id,
            specialty: spec
          }))
        });
      }
    }

    if (portfolio !== undefined) {
      await prisma.professionalPortfolio.deleteMany({
        where: { professional_id: updated.id }
      });
      if (portfolio && portfolio.length > 0) {
        await prisma.professionalPortfolio.createMany({
          data: portfolio.map((url: string, index: number) => ({
            professional_id: updated.id,
            media_url: url,
            media_type: 'image',
            display_order: index
          }))
        });
      }
    }

    const result = await prisma.professional.findUnique({
      where: { id: updated.id },
      include: {
        specialties: true,
        portfolio: true,
        packages: true,
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating professional profile:', error);
    res.status(500).json({ error: 'Failed to update professional profile' });
  }
};
