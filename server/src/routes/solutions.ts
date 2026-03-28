import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { problemId, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (problemId) {
    where.problemId = problemId;
  }

  try {
    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          problem: {
            select: { id: true, title: true, platformName: true },
          },
          createdBy: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.solution.count({ where }),
    ]);

    res.json({
      data: solutions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ error: 'Failed to fetch solutions' });
  }
});

router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        problem: {
          include: {
            createdBy: {
              select: { id: true, nickname: true, avatar: true },
            },
          },
        },
        createdBy: {
          select: { id: true, nickname: true, avatar: true, email: true },
        },
        feedback: {
          include: {
            user: {
              select: { id: true, nickname: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { feedback: true, verifications: true },
        },
      },
    });

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    res.json(solution);
  } catch (error) {
    console.error('Error fetching solution:', error);
    res.status(500).json({ error: 'Failed to fetch solution' });
  }
});

router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const {
    problemId,
    title,
    applicableEnvironment,
    rootCause,
    steps,
    alternativePaths,
    verificationMethod,
    invalidConditions,
    notes,
    createdById,
  } = req.body;

  if (!problemId || !title || !steps || !createdById) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const solution = await prisma.solution.create({
      data: {
        problemId,
        title,
        applicableEnvironment: applicableEnvironment ? JSON.stringify(applicableEnvironment) : null,
        rootCause,
        steps: JSON.stringify(steps),
        alternativePaths: alternativePaths ? JSON.stringify(alternativePaths) : null,
        verificationMethod,
        invalidConditions,
        notes,
        createdById,
      },
      include: {
        problem: {
          select: { id: true, title: true, platformName: true },
        },
        createdBy: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    // Update problem status to available if it was pending
    await prisma.problem.update({
      where: { id: problemId },
      data: { status: 'available' },
    });

    res.status(201).json(solution);
  } catch (error) {
    console.error('Error creating solution:', error);
    res.status(500).json({ error: 'Failed to create solution' });
  }
});

router.put('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;
  const {
    title,
    applicableEnvironment,
    rootCause,
    steps,
    alternativePaths,
    verificationMethod,
    invalidConditions,
    notes,
    verificationStatus,
  } = req.body;

  try {
    const data: any = {
      title,
      rootCause,
      verificationMethod,
      invalidConditions,
      notes,
      verificationStatus,
    };

    if (applicableEnvironment) {
      data.applicableEnvironment = JSON.stringify(applicableEnvironment);
    }
    if (steps) {
      data.steps = JSON.stringify(steps);
    }
    if (alternativePaths) {
      data.alternativePaths = JSON.stringify(alternativePaths);
    }
    if (verificationStatus === 'verified' || verificationStatus === 'multi_verified') {
      data.verifiedAt = new Date();
    }

    const solution = await prisma.solution.update({
      where: { id },
      data,
      include: {
        problem: {
          select: { id: true, title: true, platformName: true },
        },
        createdBy: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    res.json(solution);
  } catch (error) {
    console.error('Error updating solution:', error);
    res.status(500).json({ error: 'Failed to update solution' });
  }
});

router.delete('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    await prisma.solution.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting solution:', error);
    res.status(500).json({ error: 'Failed to delete solution' });
  }
});

export default router;
