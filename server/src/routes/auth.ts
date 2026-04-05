import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

// Email configuration from environment variables
const EMAIL_HOST = process.env.SMTP_HOST || '';
const EMAIL_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const EMAIL_USER = process.env.SMTP_USER || '';
const EMAIL_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.SMTP_FROM || 'AgentSolveHub <noreply@agentsolvehub.com>';

// Create email transporter
function createTransporter() {
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

const sendCodeSchema = z.object({
  email: z.string().email(),
});

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// Send email with verification code
async function sendEmailCode(email: string, code: string): Promise<boolean> {
  const transporter = createTransporter();

  // If no email config, log to console (for testing)
  if (!transporter) {
    console.log(`[EMAIL] To: ${email}, Code: ${code}`);
    console.log('[EMAIL] SMTP not configured, set SMTP_HOST, SMTP_USER, SMTP_PASS to enable');
    return true;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'AgentSolveHub 验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #005bc4;">AgentSolveHub 验证码</h2>
          <p>您好，</p>
          <p>您的验证码是：</p>
          <div style="font-size: 32px; font-weight: bold; color: #005bc4; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; letter-spacing: 8px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">验证码将在 10 分钟后过期，请尽快使用。</p>
          <p style="color: #999; font-size: 12px;">如果您没有请求此验证码，请忽略此邮件。</p>
        </div>
      `,
    });
    console.log(`[EMAIL] Sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send:', error);
    return false;
  }
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
