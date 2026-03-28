import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

const sendCodeSchema = z.object({
  email: z.string().email(),
});

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// Mock email sending for testing (in production, integrate with Aliyun)
async function sendEmailCode(email: string, code: string): Promise<boolean> {
  // Mock: always succeeds in test environment
  console.log(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
  return true;
}

router.post('/send-code', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { email } = req.body;

  const result = sendCodeSchema.safeParse({ email });
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Delete any existing codes for this email
    await prisma.emailCode.deleteMany({
      where: { email },
    });

    // Create new code
    await prisma.emailCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email (mock in test environment)
    await sendEmailCode(email, code);

    res.json({ message: 'Verification code sent', expiresAt });
  } catch (error) {
    console.error('Error sending code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

router.post('/verify', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { email, code } = req.body;

  const result = verifyCodeSchema.safeParse({ email, code });
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Find valid code
    const emailCode = await prisma.emailCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!emailCode) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    // Delete the used code
    await prisma.emailCode.delete({
      where: { id: emailCode.id },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          nickname: email.split('@')[0],
          emailVerified: true,
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

router.get('/me', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  // Client should delete the token
  res.json({ message: 'Logged out successfully' });
});

export default router;
