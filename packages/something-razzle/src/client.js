import App from './App';
import React from 'react';
import { hydrate } from 'react-dom';

hydrate(<App />, window.document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
