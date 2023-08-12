import type { InferReadableType, ReadableAsyncState, AsyncValue } from 'awai';
import { useEffect, useState } from 'react';

const useAsyncStateValue = <T extends ReadableAsyncState<any>, V = InferReadableType<T>>(
  readable: T,
): AsyncValue<V> => {
  const [state, setState] = useState<AsyncValue<V>>(readable.getAsync);

  useEffect(() => {
    let mounted = true;

    setState(readable.getAsync());

    (async () => {
      while (mounted) {
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/awai/issues/1
         */
        await readable.events.changed;
        if (mounted) {
          setState(readable.getAsync());
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [readable]);

  return state;
};

export default useAsyncStateValue;
