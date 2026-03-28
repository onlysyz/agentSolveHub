import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { solutionId, problemId, page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (solutionId) where.solutionId = solutionId;
  if (problemId) where.problemId = problemId;

  try {
    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
          solution: {
            select: { id: true, title: true },
          },
          problem: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.feedback.count({ where }),
    ]);

    res.json({
      data: feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { problemId, solutionId, userId, resultType, environmentNote, comment } = req.body;

  if (!userId || !resultType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!problemId && !solutionId) {
    return res.status(400).json({ error: 'Either problemId or solutionId is required' });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        problemId: problemId || null,
        solutionId: solutionId || null,
        userId,
        resultType,
        environmentNote,
        comment,
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    // Update solution verification count and status if this is solution feedback
    if (solutionId) {
      const solution = await prisma.solution.findUnique({
        where: { id: solutionId },
        include: { _count: { select: { feedback: true, verifications: true } } },
      });

      if (solution) {
        const effectiveCount = await prisma.feedback.count({
          where: { solutionId, resultType: 'effective' },
        });
        const totalFeedback = solution._count.feedback;

        let newStatus = 'unverified';
        if (totalFeedback >= 3 && effectiveCount / totalFeedback >= 0.7) {
          newStatus = 'verified';
        } else if (totalFeedback >= 1) {
          newStatus = 'community_verified';
        }

        await prisma.solution.update({
          where: { id: solutionId },
          data: {
            verificationCount: totalFeedback,
            verificationStatus: newStatus,
            verifiedAt: newStatus.includes('verified') ? new Date() : undefined,
          },
        });
      }
    }

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

export default router;
