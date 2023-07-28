import React from 'react';
import { act, render } from '@testing-library/react';
import { asyncState, delay, state } from 'awai';

import { useStateValue } from '../src';

describe('useStateValue', () => {
  it('reads an initial value of a state', () => {
    const nameState = state('Awai');
    const Component = () => useStateValue(nameState);
    const result = render(<Component />);
    expect(result.container.textContent).toEqual('Awai');
  });

  it('reads an updated value of a state', async () => {
    const nameState = state('test');
    const Component = () => useStateValue(nameState);
    const result = render(<Component />);
    await delay(0);
    await act(() => nameState.set('Awai'));
    expect(result.container.textContent).toEqual('Awai');
  });

  it('reads an initial value of an async state', () => {
    const nameState = asyncState('Awai');
    const Component = () => useStateValue(nameState);
    const result = render(<Component />);
    expect(result.container.textContent).toEqual('Awai');
  });

  it('suspends when reading a pending async state', async () => {
    const nameState = asyncState(delay(10).then(() => 'Awai'));
    expect(() => useStateValue(nameState)).toThrow();
  });

  it('reads an updated value of an async state', async () => {
    const nameState = asyncState(delay(20).then(() => 'Awai'));
    const Component = () => useStateValue(nameState);
    const result = render(<Component />);
    await act(() => delay(30));
    expect(result!.container.textContent).toEqual('Awai');
  });
});
