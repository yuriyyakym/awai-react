import { isReadableAsyncState, ReadableAsyncState, ReadableState, race, scenario } from 'awai';

const createSubscribe = <T extends ReadableState<any> | ReadableAsyncState<any>>(readable: T) => {
  return (onStoreChange: () => void) => {
    const abortController = new AbortController();

    scenario(
      () =>
        isReadableAsyncState(readable)
          ? race(
              [readable.events.requested, readable.events.fulfilled, readable.events.rejected],
              abortController.signal,
            )
          : readable.events.changed.abortable(abortController.signal),
      onStoreChange,
      { until: abortController.signal },
    );

    return () => {
      abortController.abort();
    };
  };
};

export default createSubscribe;
