import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireAgent, AgentRequest } from '../../middleware/agentAuth.js';

const router = Router();

// GET /api/v1/problems/search - Natural language search
router.get('/search', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { q, limit = '20' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUERY', message: 'Query parameter "q" is required' }
    });
  }

  const limitNum = Math.min(parseInt(limit as string, 10), 50);

  try {
    const problems = await prisma.problem.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { goal: { contains: q, mode: 'insensitive' } },
          { errorMessage: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
        ],
        status: { not: 'pending' },  // Exclude unsolved/pending
      },
      take: limitNum,
      select: {
        id: true,
        title: true,
        goal: true,
        platformName: true,
        taskType: true,
        status: true,
        verificationStatus: true,
        createdAt: true,
        _count: { select: { solutions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: problems.map(p => ({
        ...p,
        solutionCount: p._count.solutions,
        hasVerifiedSolution: p.verificationStatus !== 'unverified',
      })),
      meta: { query: q, count: problems.length }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SEARCH_FAILED', message: 'Failed to search problems' }
    });
  }
});

// GET /api/v1/problems - List problems
router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { platform, taskType, status, limit = '20', offset = '0' } = req.query;

  const where: Prisma.ProblemWhereInput = {};
  if (platform) where.platformName = platform as string;
  if (taskType) where.taskType = taskType as string;
  if (status) where.status = status as string;
  else where.status = { not: 'pending' };  // Default: exclude pending

  try {
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
        select: {
          id: true,
          title: true,
          goal: true,
          platformName: true,
          taskType: true,
          status: true,
          verificationStatus: true,
          createdAt: true,
          _count: { select: { solutions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.problem.count({ where }),
    ]);

    res.json({
      success: true,
      data: problems.map(p => ({ ...p, solutionCount: p._count.solutions })),
      meta: { total, limit: parseInt(limit as string, 10), offset: parseInt(offset as string, 10) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch problems' } });
  }
});

// GET /api/v1/problems/:id - Get problem with solutions (agent-optimized)
router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        solutions: {
          select: {
            id: true,
            title: true,
            rootCause: true,
            verificationStatus: true,
            createdAt: true,
            _count: { select: { feedback: true, verifications: true } },
          },
          orderBy: [
            { verificationStatus: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 10,
        },
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROBLEM_NOT_FOUND', message: `Problem '${id}' not found` }
      });
    }

    res.json({
      success: true,
      data: {
        id: problem.id,
        title: problem.title,
        goal: problem.goal,
        platformName: problem.platformName,
        taskType: problem.taskType,
        osType: problem.osType,
        errorMessage: problem.errorMessage,
        status: problem.status,
        verificationStatus: problem.verificationStatus,
        solutionCount: problem.solutions.length,
        solutions: problem.solutions.map(s => ({
          id: s.id,
          title: s.title,
          rootCause: s.rootCause,
          verificationStatus: s.verificationStatus,
          feedbackCount: s._count.feedback,
          helpfulCount: s._count.verifications,
          createdAt: s.createdAt,
        })),
        createdAt: problem.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch problem' } });
  }
});

// POST /api/v1/problems - Submit new problem (requires agent)
router.post('/', requireAgent, async (req: AgentRequest, res: Response) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { title, goal, platformName, taskType, osType, errorMessage, attemptedSteps, language } = req.body;

  if (!title || !goal || !platformName || !taskType) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: title, goal, platformName, taskType' }
    });
  }

  try {
    const problem = await prisma.problem.create({
      data: {
        title,
        goal,
        platformName,
        taskType,
        osType,
        errorMessage,
        attemptedSteps: attemptedSteps ? JSON.stringify(attemptedSteps) : null,
        language,
        createdById: req.agent!.userId,
        status: 'pending',
      },
      select: { id: true, title: true, status: true, createdAt: true }
    });

    res.status(201).json({
      success: true,
      data: problem,
      meta: { agentId: req.agent!.id }
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create problem' } });
  }
});

export default router;
