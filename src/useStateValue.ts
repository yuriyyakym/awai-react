import {
  type InferReadableType,
  type ReadableAsyncState,
  type ReadableState,
  isReadableAsyncState,
} from 'awai';
import { useEffect, useState } from 'react';

const useStateValue = <T extends ReadableState<any> | ReadableAsyncState<any>>(
  readable: T,
): InferReadableType<T> => {
  const [state, setState] = useState<T | undefined>(readable.get);

  if (isReadableAsyncState(readable) && readable.get() === undefined) {
    throw new Promise((resolve) => readable.events.changed.then(resolve));
  }

  useEffect(() => {
    let mounted = true;

    setState(readable.get());

    (async () => {
      while (mounted) {
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/awai/issues/1
         */
        const newValue = await readable.events.changed;
        if (mounted) {
          setState(newValue);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [readable]);

  return state as InferReadableType<T>;
};

export default useStateValue;
