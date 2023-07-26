import type { AsyncSetter, AsyncState, Setter, State } from 'awai';

import useSetState from './useSetState';
import useStateValue from './useStateValue';

type Return<T> = T extends State<infer U>
  ? [U, Setter<U>]
  : T extends AsyncState<infer V>
  ? [V, AsyncSetter<V>]
  : never;

function useState<T>(state: State<T>): Return<State<T>>;
function useState<T>(state: AsyncState<T>): Return<AsyncState<T>>;
function useState<T>(state: State<T> | AsyncState<T>) {
  const value = useStateValue(state);
  const setValue = useSetState(state);

  return [value, setValue];
}

export default useState;
