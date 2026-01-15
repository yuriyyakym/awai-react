import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { asyncState, delay, state } from 'awai';

import { useAsyncStateValue, useState, useStateValue } from '../src';

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

  it('throws to an error boundary when an async state rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const nameState = asyncState(delay(10).then(() => Promise.reject(new Error('boom'))));

    class ErrorBoundary extends React.Component<
      { fallback: string; children: React.ReactNode },
      { hasError: boolean }
    > {
      state = { hasError: false };

      static getDerivedStateFromError() {
        return { hasError: true };
      }

      render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
      }
    }

    const Component = () => useStateValue(nameState);
    const result = await render(
      <ErrorBoundary fallback="error">
        <React.Suspense fallback="loading">
          <Component />
        </React.Suspense>
      </ErrorBoundary>,
    );

    expect(result.container.textContent).toEqual('loading');

    await act(async () => {
      await delay(20);
    });

    expect(result.container.textContent).toEqual('error');
    await result.unmount();
    errorSpy.mockRestore();
  });
});

describe('useAsyncStateValue', () => {
  it('reports loading and then value for a pending async state', async () => {
    const nameState = asyncState(delay(10).then(() => 'Awai'));
    const Component = () => {
      const snapshot = useAsyncStateValue(nameState);
      const status = snapshot.error ? 'error' : snapshot.isLoading ? 'loading' : 'ready';
      const value = snapshot.value ?? '-';
      return <div>{`${status}:${value}`}</div>;
    };

    const result = await render(<Component />);
    expect(result.container.textContent).toEqual('loading:-');

    await act(async () => {
      await delay(20);
    });

    expect(result.container.textContent).toEqual('ready:Awai');
    await result.unmount();
  });

  it('reports error for a rejected async state', async () => {
    const nameState = asyncState(delay(10).then(() => Promise.reject(new Error('boom'))));
    const Component = () => {
      const snapshot = useAsyncStateValue(nameState);
      const status = snapshot.error ? 'error' : snapshot.isLoading ? 'loading' : 'ready';
      return <div>{status}</div>;
    };

    const result = await render(<Component />);
    expect(result.container.textContent).toEqual('loading');

    await act(async () => {
      await delay(20);
    });

    expect(result.container.textContent).toEqual('error');
    await result.unmount();
  });
});

describe('useState', () => {
  it('returns value and setter for a state', async () => {
    const nameState = state('test');
    let setName: ((value: string) => Promise<string>) | undefined;

    const Component = () => {
      const [value, setValue] = useState(nameState);
      setName = setValue;
      return <div>{value}</div>;
    };

    const result = await render(<Component />);
    expect(result.container.textContent).toEqual('test');

    await act(async () => {
      await setName?.('Awai');
    });

    expect(result.container.textContent).toEqual('Awai');
    await result.unmount();
  });
});
