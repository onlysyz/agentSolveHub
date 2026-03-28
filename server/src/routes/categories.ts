import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

router.get('/platforms', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const platforms = await prisma.problem.groupBy({
      by: ['platformName'],
      _count: {
        platformName: true,
      },
      orderBy: {
        _count: {
          platformName: 'desc',
        },
      },
    });

    const result = platforms.map((p) => ({
      name: p.platformName,
      count: p._count.platformName,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

router.get('/task-types', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const taskTypes = await prisma.problem.groupBy({
      by: ['taskType'],
      _count: {
        taskType: true,
      },
      orderBy: {
        _count: {
          taskType: 'desc',
        },
      },
    });

    const result = taskTypes.map((t) => ({
      name: t.taskType,
      count: t._count.taskType,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching task types:', error);
    res.status(500).json({ error: 'Failed to fetch task types' });
  }
});

router.get('/os-types', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const osTypes = await prisma.problem.groupBy({
      by: ['osType'],
      _count: {
        osType: true,
      },
      where: {
        osType: { not: null },
      },
      orderBy: {
        _count: {
          osType: 'desc',
        },
      },
    });

    const result = osTypes.map((o) => ({
      name: o.osType,
      count: o._count.osType,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching OS types:', error);
    res.status(500).json({ error: 'Failed to fetch OS types' });
  }
});

router.get('/stats', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const [totalProblems, totalSolutions, verifiedProblems, totalUsers] = await Promise.all([
      prisma.problem.count(),
      prisma.solution.count(),
      prisma.problem.count({ where: { verificationStatus: 'verified' } }),
      prisma.user.count(),
    ]);

    res.json({
      totalProblems,
      totalSolutions,
      verifiedProblems,
      totalUsers,
      verificationRate: totalProblems > 0 ? Math.round((verifiedProblems / totalProblems) * 100) : 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
