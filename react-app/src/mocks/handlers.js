// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';
import { staticData } from './static-data';

export const handlers = [
  rest.get('/api/tweets', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(staticData));
  }),

  rest.get('https://pbs.twimg.com/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
];

export const unhandledRequestHandler = ({ url }) => {
  console.warn(
    `Mock server: Unhandled request to ${url}, passing through to real server.`
  );
};
