import type { AsyncSetter, AsyncState, Setter, State } from 'awai';

import useAwaiSetState from './useAwaiSetState';
import useAwaiStateValue from './useAwaiStateValue';

type Return<T> = T extends State<infer U>
  ? [U, Setter<U>]
  : T extends AsyncState<infer V>
  ? [V, AsyncSetter<V>]
  : never;

function useAwaiState<T>(state: State<T>): Return<State<T>>;
function useAwaiState<T>(state: AsyncState<T>): Return<AsyncState<T>>;
function useAwaiState<T>(state: State<T> | AsyncState<T>) {
  const value = useAwaiStateValue(state);
  const setValue = useAwaiSetState(state);

  return [value, setValue];
}

export default useAwaiState;
