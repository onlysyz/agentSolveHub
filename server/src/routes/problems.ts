import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();

interface QueryParams {
  page?: string;
  limit?: string;
  platform?: string;
  taskType?: string;
  osType?: string;
  status?: string;
  verificationStatus?: string;
  search?: string;
  sort?: string;
  order?: string;
}

router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const {
    page = '1',
    limit = '20',
    platform,
    taskType,
    osType,
    status,
    verificationStatus,
    search,
    sort = 'createdAt',
    order = 'desc',
  } = req.query as QueryParams;

  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.ProblemWhereInput = {};

  if (platform) {
    where.platformName = { equals: platform, mode: 'insensitive' };
  }
  if (taskType) {
    where.taskType = { equals: taskType, mode: 'insensitive' };
  }
  if (osType) {
    where.osType = { equals: osType, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }
  if (verificationStatus) {
    where.verificationStatus = verificationStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { summary: { contains: search as string, mode: 'insensitive' } },
      { goal: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.ProblemOrderByWithRelationInput = {};
  if (sort === 'updatedAt') {
    orderBy.updatedAt = order === 'asc' ? 'asc' : 'desc';
  } else if (sort === 'viewCount') {
    orderBy.viewCount = order === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = order === 'asc' ? 'asc' : 'desc';
  }

  try {
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          createdBy: {
            select: { id: true, nickname: true, avatar: true },
          },
          _count: {
            select: { solutions: true },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    res.json({
      data: problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, nickname: true, avatar: true, email: true },
        },
        solutions: {
          include: {
            createdBy: {
              select: { id: true, nickname: true, avatar: true },
            },
            _count: {
              select: { feedback: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { solutions: true, feedback: true },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Increment view count
    await prisma.problem.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const {
    title,
    summary,
    goal,
    platformName,
    taskType,
    osType,
    softwareVersion,
    language,
    errorMessage,
    attemptedSteps,
    createdById,
  } = req.body;

  if (!title || !goal || !platformName || !taskType || !createdById) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const problem = await prisma.problem.create({
      data: {
        title,
        summary,
        goal,
        platformName,
        taskType,
        osType,
        softwareVersion,
        language,
        errorMessage,
        attemptedSteps: attemptedSteps ? JSON.stringify(attemptedSteps) : null,
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    res.status(201).json(problem);
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

router.put('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;
  const {
    title,
    summary,
    goal,
    platformName,
    taskType,
    osType,
    softwareVersion,
    language,
    errorMessage,
    attemptedSteps,
    status,
    verificationStatus,
  } = req.body;

  try {
    const problem = await prisma.problem.update({
      where: { id },
      data: {
        title,
        summary,
        goal,
        platformName,
        taskType,
        osType,
        softwareVersion,
        language,
        errorMessage,
        attemptedSteps: attemptedSteps ? JSON.stringify(attemptedSteps) : undefined,
        status,
        verificationStatus,
      },
      include: {
        createdBy: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    res.json(problem);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

router.delete('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    await prisma.problem.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

router.get('/:id/solutions', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const solutions = await prisma.solution.findMany({
      where: { problemId: id },
      include: {
        createdBy: {
          select: { id: true, nickname: true, avatar: true },
        },
        _count: {
          select: { feedback: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(solutions);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ error: 'Failed to fetch solutions' });
  }
});

export default router;
