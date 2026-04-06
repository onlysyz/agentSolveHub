import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// GET /api/v1/categories/platforms
router.get('/platforms', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const platforms = await prisma.problem.groupBy({
      by: ['platformName'],
      _count: { platformName: true },
      orderBy: { _count: { platformName: 'desc' } },
    });

    res.json({
      success: true,
      data: platforms.map(p => ({ name: p.platformName, count: p._count.platformName }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED' } });
  }
});

// GET /api/v1/categories/task-types
router.get('/task-types', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const taskTypes = await prisma.problem.groupBy({
      by: ['taskType'],
      _count: { taskType: true },
      orderBy: { _count: { taskType: 'desc' } },
    });

    res.json({
      success: true,
      data: taskTypes.map(t => ({ name: t.taskType, count: t._count.taskType }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED' } });
  }
});

// GET /api/v1/categories/os-types
router.get('/os-types', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;

  try {
    const osTypes = await prisma.problem.groupBy({
      by: ['osType'],
      _count: { osType: true },
      where: { osType: { not: null } },
      orderBy: { _count: { osType: 'desc' } },
    });

    res.json({
      success: true,
      data: osTypes.map(o => ({ name: o.osType, count: o._count.osType }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED' } });
  }
});

export default router;
