import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';

import health from './routes/health';
import chat from './routes/chat';
import corrector from './routes/corrector';
import game from './routes/game';
import { gameService } from './lib/ai/gameService';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })
);

// Routes
app.route('/api/health', health);
app.route('/api/chat', chat);
app.route('/api/correct', corrector);
app.route('/api/game', game);

// Root
app.get('/', (c) =>
  c.json({
    name: 'Teach API',
    version: '0.1.0',
    description: 'AI English Learning Chat - Backend Proxy',
  })
);

// Initialize game service with pre-generated questions in the background
async function initializeServices() {
  // Start generating questions in the background (don't block server startup)
  gameService
    .initialize()
    .catch((error) => console.error('Background initialization error:', error));
}

// Start server immediately
const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Teach API server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Initialize services in background after server starts
initializeServices();
