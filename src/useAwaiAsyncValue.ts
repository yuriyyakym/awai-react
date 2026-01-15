import type { ReadableAsyncState, AsyncValue } from 'awai';
import { useMemo, useSyncExternalStore } from 'react';
import createGetSnapshot from './lib/createGetSnapshot';
import createSubscribe from './lib/createSubscribe';

const useAwaiAsyncValue = <T>(readable: ReadableAsyncState<T>): AsyncValue<T> => {
  const subscribe = useMemo(() => createSubscribe(readable), [readable]);
  const getSnapshot = useMemo(() => createGetSnapshot(readable), [readable]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

export default useAwaiAsyncValue;
