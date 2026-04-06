import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

interface AgentRequest extends Request {
  agent?: {
    id: string;
    name?: string;
    version?: string;
    userId: string;
  };
}

async function agentMiddleware(req: AgentRequest, res: Response, next: NextFunction) {
  const agentId = req.headers['x-agent-id'] as string;

  // If no agent ID, this is a read-only anonymous request
  if (!agentId) {
    req.agent = undefined;
    return next();
  }

  // Agent ID provided - lookup or create user record
  const prisma = req.app.locals.prisma as PrismaClient;

  let user = await prisma.user.findFirst({
    where: { agentId }
  });

  if (!user) {
    // Auto-register agent
    user = await prisma.user.create({
      data: {
        email: `agent-${agentId}@agentsolvehub.local`,
        nickname: req.headers['x-agent-name'] as string || agentId,
        isAgent: true,
        agentId,
        agentMeta: JSON.stringify({
          name: req.headers['x-agent-name'],
          version: req.headers['x-agent-version'],
        }),
      }
    });
  }

  req.agent = {
    id: agentId,
    name: req.headers['x-agent-name'] as string,
    version: req.headers['x-agent-version'] as string,
    userId: user.id,
  };

  next();
}

function requireAgent(req: AgentRequest, res: Response, next: NextFunction) {
  if (!req.agent) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AGENT_ID_REQUIRED',
        message: 'Agent identification required. Include X-Agent-ID header.'
      }
    });
  }
  next();
}

export { agentMiddleware, requireAgent };
export type { AgentRequest };
