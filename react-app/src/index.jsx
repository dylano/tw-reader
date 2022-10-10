import React from 'react';
import { createRoot } from 'react-dom/client';
import { worker, unhandledRequestHandler } from './mocks/browser';
import * as serviceWorker from './serviceWorker';
import './index.css';
import App from './App';

if (
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_MOCK_SERVER === 'true'
) {
  worker.start({ onUnhandledRequest: unhandledRequestHandler });
}
const container =
  document.getElementById('root') || document.createElement('div');
const root = createRoot(container);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
