import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAgent, AgentRequest } from '../../middleware/agentAuth.js';

const router = Router();

// POST /api/v1/solutions - Submit solution (requires agent)
router.post('/', requireAgent, async (req: AgentRequest, res: Response) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { problemId, title, rootCause, steps, alternativePaths, notes } = req.body;

  if (!problemId || !title || !steps) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: problemId, title, steps' }
    });
  }

  // Verify problem exists
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROBLEM_NOT_FOUND', message: `Problem '${problemId}' not found` }
    });
  }

  try {
    const solution = await prisma.solution.create({
      data: {
        problemId,
        title,
        rootCause,
        steps: JSON.stringify(steps),
        alternativePaths: alternativePaths ? JSON.stringify(alternativePaths) : null,
        notes,
        createdById: req.agent!.userId,
      },
      select: { id: true, problemId: true, title: true, verificationStatus: true, createdAt: true }
    });

    // Update problem status
    await prisma.problem.update({
      where: { id: problemId },
      data: { status: 'available' }
    });

    res.status(201).json({
      success: true,
      data: solution,
      meta: { agentId: req.agent!.id }
    });
  } catch (error) {
    console.error('Create solution error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create solution' } });
  }
});

// GET /api/v1/solutions/:id - Get solution with details
router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        problem: {
          select: { id: true, title: true, platformName: true }
        },
        _count: { select: { feedback: true, verifications: true } }
      }
    });

    if (!solution) {
      return res.status(404).json({
        success: false,
        error: { code: 'SOLUTION_NOT_FOUND', message: `Solution '${id}' not found` }
      });
    }

    res.json({
      success: true,
      data: {
        id: solution.id,
        title: solution.title,
        rootCause: solution.rootCause,
        steps: JSON.parse(solution.steps),
        alternativePaths: solution.alternativePaths ? JSON.parse(solution.alternativePaths) : null,
        verificationMethod: solution.verificationMethod,
        notes: solution.notes,
        verificationStatus: solution.verificationStatus,
        problem: solution.problem,
        feedbackCount: solution._count.feedback,
        helpfulCount: solution._count.verifications,
        createdAt: solution.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch solution' } });
  }
});

// POST /api/v1/solutions/:id/helpful - Mark solution as helpful (agent)
router.post('/:id/helpful', requireAgent, async (req: AgentRequest, res: Response) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const id = req.params.id as string;

  try {
    const solution = await prisma.solution.findUnique({ where: { id } });
    if (!solution) {
      return res.status(404).json({
        success: false,
        error: { code: 'SOLUTION_NOT_FOUND', message: `Solution '${id}' not found` }
      });
    }

    // Check if already marked helpful by this agent
    const existing = await prisma.verification.findFirst({
      where: { solutionId: id, userId: req.agent!.userId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_MARKED', message: 'You have already marked this solution as helpful' }
      });
    }

    // Create verification record
    const verification = await prisma.verification.create({
      data: {
        solutionId: id,
        userId: req.agent!.userId,
      }
    });

    // Update solution verification count
    await prisma.solution.update({
      where: { id },
      data: { verificationCount: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      data: { verificationId: verification.id, helpful: true },
      meta: { agentId: req.agent!.id }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: { code: 'VERIFICATION_FAILED', message: 'Failed to mark as helpful' } });
  }
});

// GET /api/v1/solutions/:id/feedback - Get solution feedback
router.get('/:id/feedback', async (req, res) => {
  const prisma = req.app.locals.prisma as PrismaClient;
  const { id } = req.params;

  try {
    const feedback = await prisma.feedback.findMany({
      where: { solutionId: id },
      select: {
        id: true,
        resultType: true,
        environmentNote: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const summary = {
      total: feedback.length,
      effective: feedback.filter(f => f.resultType === 'effective').length,
      partial: feedback.filter(f => f.resultType === 'partial').length,
      ineffective: feedback.filter(f => f.resultType === 'ineffective').length,
    };

    res.json({
      success: true,
      data: feedback,
      meta: { summary }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch feedback' } });
  }
});

export default router;
