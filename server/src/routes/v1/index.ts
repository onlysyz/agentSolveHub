import { Router } from 'express';
import { agentMiddleware } from '../../middleware/agentAuth.js';
import { rateLimitMiddleware } from '../../middleware/rateLimit.js';
import problemsRouter from './problems.js';
import solutionsRouter from './solutions.js';
import categoriesRouter from './categories.js';

const router = Router();

// Apply middleware to all v1 routes
router.use(agentMiddleware);
router.use(rateLimitMiddleware);

// Mount routes
router.use('/problems', problemsRouter);
router.use('/solutions', solutionsRouter);
router.use('/categories', categoriesRouter);

export default router;
