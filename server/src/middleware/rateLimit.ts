import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMIT = {
  windowMs: 60 * 1000,  // 1 minute window
  maxRequestsAgent: 100,   // per window for agents
  maxRequestsAnonymous: 20,  // for anonymous reads
};

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const agentId = req.headers['x-agent-id'] as string;
  const key = agentId || req.ip;
  const now = Date.now();

  let record = rateLimitStore.get(key || 'anonymous');

  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + RATE_LIMIT.windowMs,
    };
    rateLimitStore.set(key || 'anonymous', record);
  }

  const limit = agentId ? RATE_LIMIT.maxRequestsAgent : RATE_LIMIT.maxRequestsAnonymous;

  if (record.count >= limit) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetAt - now) / 1000)
      }
    });
  }

  record.count++;

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': (limit - record.count).toString(),
    'X-RateLimit-Reset': record.resetAt.toString(),
  });

  next();
}

export { rateLimitMiddleware };
