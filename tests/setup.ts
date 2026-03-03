import { config } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test') });

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Reset handlers between tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
