import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

import problemsRouter from './routes/problems.js';
import solutionsRouter from './routes/solutions.js';
import feedbackRouter from './routes/feedback.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import usersRouter from './routes/users.js';
import v1Router from './routes/v1/index.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Make prisma available in routes
app.locals.prisma = prisma;

// Routes
app.use('/api/v1', v1Router);  // Agent-friendly API (must be before /api/*)
app.use('/api/problems', problemsRouter);
app.use('/api/solutions', solutionsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
