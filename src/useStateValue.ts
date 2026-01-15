import {
  type AsyncValue,
  type ReadableAsyncState,
  type ReadableState,
  isReadableAsyncState,
} from 'awai';
import { use, useMemo, useSyncExternalStore } from 'react';
import createSubscribe from './lib/createSubscribe';
import createGetSnapshot from './lib/createGetSnapshot';

const useStateValue = <T>(readable: ReadableState<T> | ReadableAsyncState<T>): T => {
  const isAsync = isReadableAsyncState(readable);
  const getSnapshot = useMemo(() => createGetSnapshot(readable), [readable]);
  const subscribe = useMemo(() => createSubscribe(readable), [readable]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const isLoading = isAsync && (snapshot as AsyncValue<T>).isLoading;

  const isSettledPromise = useMemo(
    () => (isLoading ? readable.getPromise() : undefined),
    [readable, isLoading],
  );

  if (!isAsync) {
    return snapshot as T;
  }

  const asyncSnapshot = snapshot as AsyncValue<T>;

  if (asyncSnapshot.error) {
    throw asyncSnapshot.error;
  }

  if (isSettledPromise) {
    use(isSettledPromise);
  }

  return asyncSnapshot.value!;
};

export default useStateValue;
