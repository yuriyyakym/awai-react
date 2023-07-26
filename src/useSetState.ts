import type { WritableAsyncState, WritableState } from 'awai';

const useSetState = <Q extends WritableState<T> | WritableAsyncState<T>, T = any>(
  writable: Q,
): Q['set'] => {
  return writable.set;
};

export default useSetState;
