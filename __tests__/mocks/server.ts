/**
 * MSW Server Setup
 * Mock Service Worker configuration for testing
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup mock server with our handlers
export const server = setupServer(...handlers);

// Export server for test utilities
export { handlers } from './handlers';