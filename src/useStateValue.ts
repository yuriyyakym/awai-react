import { ReadableAsyncState, ReadableState, isReadableAsyncState } from 'awai';
import { useEffect, useState } from 'react';

const useStateValue = <T>(readable: ReadableState<T> | ReadableAsyncState<T>): T => {
  const [state, setState] = useState<T | undefined>(readable.get);

  if (isReadableAsyncState(readable) && state === undefined) {
    throw new Promise((resolve) => readable.events.changed.then(resolve));
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      while (mounted) {
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/awai/issues/1
         */
        await readable.events.changed;
        if (mounted) {
          setState(readable.get());
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [readable]);

  return state as T;
};

export default useStateValue;
