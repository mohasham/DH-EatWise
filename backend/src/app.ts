import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import healthProfileRoutes from './routes/healthProfile.routes';
import ruleRoutes from './routes/rule.routes';
import mealPlanRoutes from './routes/mealPlan.routes';
import mealRoutes from './routes/meal.routes';

import globalErrorHandler from './middlewares/error.middleware';
import AppError from './utils/AppError';

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'EatWise API is running' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health-profile', healthProfileRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/meals', mealRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.all(/(.*)/, (req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use(globalErrorHandler);

export default app;
