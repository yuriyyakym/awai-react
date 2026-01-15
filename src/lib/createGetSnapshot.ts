import { AsyncValue, isReadableAsyncState, ReadableAsyncState, ReadableState } from 'awai';

type SnapshotValue<R> = R extends ReadableAsyncState<infer T>
  ? AsyncValue<T>
  : R extends ReadableState<infer T>
  ? T
  : never;

type ReadableInput = ReadableState<any> | ReadableAsyncState<any>;

function createGetSnapshot<const R extends ReadableInput>(readable: R): () => SnapshotValue<R> {
  let previousSnapshot: AsyncValue<unknown> | undefined = undefined;

  if (!isReadableAsyncState(readable)) {
    return () => readable.get();
  }

  return () => {
    const snapshot = readable.getAsync();
    const isChanged =
      snapshot.error !== previousSnapshot?.error ||
      snapshot.isLoading !== previousSnapshot?.isLoading ||
      snapshot.value !== previousSnapshot?.value;

    if (isChanged) {
      previousSnapshot = snapshot;
    }

    return snapshot as SnapshotValue<R>;
  };
}

export default createGetSnapshot;
