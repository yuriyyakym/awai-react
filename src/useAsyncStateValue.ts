import type { InferReadableType, ReadableAsyncState, AsyncValue } from 'awai';
import { useEffect, useState } from 'react';

const useAsyncStateValue = <T extends ReadableAsyncState<any>, V = InferReadableType<T>>(
  readable: T,
): AsyncValue<V> => {
  const [state, setState] = useState<AsyncValue<V>>(readable.getAsync);

  useEffect(() => {
    let mounted = true;
    let abortController: AbortController;

    setState(readable.getAsync());

    (async () => {
      while (mounted) {
        abortController = new AbortController();
        /**
         * @todo Cleanup on unmount
         * @url https://github.com/yuriyyakym/awai/issues/1
         */
        try {
          await Promise.any([
            readable.events.fulfilled.abortable(abortController),
            readable.events.rejected.abortable(abortController),
            readable.events.requested.abortable(abortController),
          ]);

          if (mounted) {
            setState(readable.getAsync());
          }
        } catch {
        } finally {
          abortController.abort();
        }
      }
    })();

    return () => {
      mounted = false;
      abortController?.abort();
    };
  }, [readable]);

  return state;
};

export default useAsyncStateValue;
