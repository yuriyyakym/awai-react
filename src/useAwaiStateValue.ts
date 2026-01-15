import {
  type AsyncValue,
  type ReadableAsyncState,
  type ReadableState,
  isReadableAsyncState,
} from 'awai';
import * as React from 'react';
import createSubscribe from './lib/createSubscribe';
import createGetSnapshot from './lib/createGetSnapshot';

const { useMemo, useSyncExternalStore } = React;
const { use } = React as { use?: (promise: Promise<unknown>) => unknown };
const suspend = (promise: Promise<unknown>) => {
  if (use) {
    use(promise);
    return;
  }

  throw promise;
};

const useAwaiStateValue = <T>(readable: ReadableState<T> | ReadableAsyncState<T>): T => {
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
    suspend(isSettledPromise);
  }

  return asyncSnapshot.value!;
};

export default useAwaiStateValue;
