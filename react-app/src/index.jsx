import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { worker } from './mocks/browser';
import App from './App';
import * as serviceWorker from './serviceWorker';

if (
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_MOCK_SERVER === 'true'
) {
  worker.start();
}
const container =
  document.getElementById('root') || document.createElement('div');
const root = createRoot(container);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
