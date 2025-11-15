import { Hono } from 'hono';
import { getAvailableProviders } from '../lib/ai/index';

const health = new Hono();

health.get('/', (c) => {
  return c.json({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    providers: getAvailableProviders(),
  });
});

export default health;
