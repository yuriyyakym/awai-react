import type { AsyncSetter, AsyncState, Setter, State } from 'awai';

function useSetState<T>(writable: State<T>): Setter<T>;
function useSetState<T>(writable: AsyncState<T>): AsyncSetter<T>;
function useSetState<T>(writable: State<T> | AsyncState<T>) {
  return writable.set;
}

export default useSetState;
