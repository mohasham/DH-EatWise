import dotenv from 'dotenv';
import path from 'path';

// Force dotenv to find the file inside the backend folder, regardless of where you call the command from
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import connectDB from './config/db';

const PORT = Number(process.env.PORT) || 5000;

const start = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] EatWise API running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`[Server] ${signal} received – shutting down gracefully`);
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[Server] Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

start();