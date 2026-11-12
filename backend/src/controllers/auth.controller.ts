import 'dotenv/config';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role, VerificationType } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123'; // Replace in production!

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = Object.values(Role).includes(role) ? role : Role.attendee;

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
        role: userRole,
      },
    });

    if (user.role === 'organizer') {
      await prisma.event.create({
        data: {
          title: 'My Launch Concert 2026',
          slug: `my-launch-concert-2026-${Date.now()}`,
          description: 'Kickoff corporate/music event created automatically for your new organizer profile.',
          organizer_id: user.id,
          start_datetime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          end_datetime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          event_type: 'in_person',
          venue_name: 'Sheraton Grand Ballroom',
          city: 'Dhaka',
          country: 'Bangladesh',
          status: 'published'
        }
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, full_name: true, email: true, role: true, avatar_url: true, is_verified: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Save token to email_verifications table
    await prisma.emailVerification.create({
      data: {
        user_id: user.id,
        token,
        type: VerificationType.reset_password,
        expires_at,
      },
    });

    res.status(200).json({
      message: 'Simulated password reset email sent successfully',
      token,
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Find the verification token in DB
    const verification = await prisma.emailVerification.findFirst({
      where: {
        token,
        type: VerificationType.reset_password,
        expires_at: { gt: new Date() },
        used_at: null,
      },
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Update user password and mark verification token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.user_id },
        data: { password_hash },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used_at: new Date() },
      }),
    ]);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
