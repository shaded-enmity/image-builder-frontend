import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { middleware, reducer } from '../store';

export const renderWithReduxRouter = (
  component,
  preloadedState = {},
  route = '/'
) => {
  const history = createMemoryHistory({ initialEntries: [route] });
  const store = configureStore({ reducer, middleware, preloadedState });
  return {
    ...render(
      <Provider store={store}>
        <Router location={history.location} navigator={history}>
          {component}
        </Router>
      </Provider>
    ),
    history,
    store,
  };
};

export const renderWithProvider = (
  component,
  container,
  preloadedState = {}
) => {
  const store = configureStore({ reducer, middleware, preloadedState });

  return render(<Provider store={store}>{component}</Provider>, {
    container: container,
  });
};
