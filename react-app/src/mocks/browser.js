// eslint-disable-next-line import/no-extraneous-dependencies
import { setupWorker } from 'msw';
import { handlers, unhandledRequestHandler } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);
export { unhandledRequestHandler };
