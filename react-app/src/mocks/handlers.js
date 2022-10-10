// src/mocks/handlers.js
import { rest } from 'msw';
import { staticData } from './static-data';

export const handlers = [
  rest.get('/api/tweets', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(staticData));
  }),
];
