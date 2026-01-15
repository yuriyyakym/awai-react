import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { asyncState, delay, state } from 'awai';

import { useStateValue } from '../src';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const render = async (ui: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(ui);
  });

  return {
    container,
    unmount: async () =>
      act(async () => {
        root.unmount();
        container.remove();
      }),
  };
};

describe('useStateValue', () => {
  it('reads an initial value of a state', async () => {
    const nameState = state('Awai');
    const Component = () => useStateValue(nameState);
    const result = await render(<Component />);
    expect(result.container.textContent).toEqual('Awai');
    await result.unmount();
  });

  it('reads an updated value of a state', async () => {
    const nameState = state('test');
    const Component = () => useStateValue(nameState);
    const result = await render(<Component />);
    await act(async () => {
      await nameState.set('Awai');
    });
    expect(result.container.textContent).toEqual('Awai');
    await result.unmount();
  });

  it('reads an initial value of an async state', async () => {
    const nameState = asyncState('Awai');
    const Component = () => useStateValue(nameState);
    const result = await render(<Component />);
    expect(result.container.textContent).toEqual('Awai');
    await result.unmount();
  });

  it('suspends when reading a pending async state', async () => {
    const nameState = asyncState(delay(10).then(() => 'Awai'));
    const Component = () => useStateValue(nameState);
    const result = await render(
      <React.Suspense fallback="loading">
        <Component />
      </React.Suspense>,
    );
    expect(result.container.textContent).toEqual('loading');
    await act(async () => {
      await delay(20);
    });
    expect(result.container.textContent).toEqual('Awai');
    await result.unmount();
  });

  it('reads an updated value of an async state', async () => {
    const nameState = asyncState(delay(20).then(() => 'Awai'));
    const Component = () => useStateValue(nameState);
    const result = await render(
      <React.Suspense fallback="loading">
        <Component />
      </React.Suspense>,
    );
    await act(async () => {
      await delay(30);
    });
    expect(result.container.textContent).toEqual('Awai');
    await result.unmount();
  });
});
