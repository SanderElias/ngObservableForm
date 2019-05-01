import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

/**
 * Function that takes a state observable and returns a method for your component
 * that allows you to set an individual property on the state observable
 */
export function createSetStateMethod<T>(
  state$: Subject<T> | ReplaySubject<T> | BehaviorSubject<T>
) {
  /**
   * A state helper method that allows you to easily update the state with
   */
  return function setState<K extends keyof T>(prop: K, newValue: T[K]) {
    return state$
      .pipe(
        first(), // Only update once!
        map<T, T>(
          (currentState: any) => ({ ...currentState, [prop]: newValue } as T)
        ), // insert the state.
        tap(newState => state$.next(newState)) // push the update to the view.
      )
      .toPromise();
  };
}

/**
 * Function that takes a state observable and returns a method for your component
 * that allows you to get an individual property from the state. It will return
 * a promise that will resolve to the current property on the state
 */
export function createGetStateMethod<T>(
  state$: Subject<T> | ReplaySubject<T> | BehaviorSubject<T>
) {
  return async function getState<K extends keyof T>(prop: K): Promise<T[K]> {
    const state = await state$.pipe(first()).toPromise();
    return state[prop];
  };
}
