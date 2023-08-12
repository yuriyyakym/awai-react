import { type InferReadableType, type ReadableAsyncState, AsyncValue } from 'awai';
import { useEffect, useState } from 'react';

const useAsyncStateValue = <Q, T extends ReadableAsyncState<Q>>(readable: T): AsyncValue<Q> => {
  const [state, setState] = useState<AsyncValue<Q>>(readable.getAsync);

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
