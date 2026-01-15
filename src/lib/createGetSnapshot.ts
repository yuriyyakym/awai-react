import { AsyncValue, isReadableAsyncState, ReadableAsyncState, ReadableState } from 'awai';

type SnapshotValue<R> = R extends ReadableAsyncState<infer T>
  ? AsyncValue<T>
  : R extends ReadableState<infer T>
  ? T
  : never;

type ReadableInput = ReadableState<any> | ReadableAsyncState<any>;

function createGetSnapshot<const R extends ReadableInput>(readable: R): () => SnapshotValue<R> {
  if (!isReadableAsyncState(readable)) {
    return () => readable.get();
  }

  let previousSnapshot: AsyncValue<unknown> | undefined = undefined;

  return () => {
    const snapshot = readable.getAsync();
    const isEaual =
      snapshot.error === previousSnapshot?.error ||
      snapshot.isLoading === previousSnapshot?.isLoading ||
      snapshot.value === previousSnapshot?.value;

    if (isEaual) {
      return previousSnapshot as SnapshotValue<R>;
    }

    previousSnapshot = snapshot;
    return snapshot as SnapshotValue<R>;
  };
}

export default createGetSnapshot;
