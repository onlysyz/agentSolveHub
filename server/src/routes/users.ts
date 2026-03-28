import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

// Middleware to verify JWT
async function authMiddleware(req: AuthRequest, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            problems: true,
            solutions: true,
            feedback: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:id/problems', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);

  try {
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where: { createdById: id },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          _count: {
            select: { solutions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.problem.count({ where: { createdById: id } }),
    ]);

    res.json({
      data: problems,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Error fetching user problems:', error);
    res.status(500).json({ error: 'Failed to fetch user problems' });
  }
});

router.get('/:id/solutions', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);

  try {
    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where: { createdById: id },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          problem: {
            select: { id: true, title: true, platformName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.solution.count({ where: { createdById: id } }),
    ]);

    res.json({
      data: solutions,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Error fetching user solutions:', error);
    res.status(500).json({ error: 'Failed to fetch user solutions' });
  }
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { nickname, avatar } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { nickname, avatar },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
