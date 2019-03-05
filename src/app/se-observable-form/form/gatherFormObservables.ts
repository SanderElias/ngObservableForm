import { merge, Observable } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { InputNameDirective } from '../input/input-name.directive';
import { FormObservables } from './FormObservables.interface';
/**
 * Gather all available inputs into a single object
 *   { [formEntryName]: Observable<inputType>}
 * this mathes the json structure of the model
 */
export function gatherFormObservables(inputs: InputNameDirective[]): FormObservables {
  const inputObservers = inputs.reduce((combinedObservers, el) => {
    // console.log(el.constructor.name, el.name);
    if (combinedObservers[el.name]) {
      /**
       * The same name already exists, merge the additional
       * one so it is exposed as a single observable.
       * note that only the last one that fire's wins.
       * This works well for radio buttons. No other inputs should get the same name
       */
      combinedObservers[el.name] = merge(combinedObservers[el.name], el.value$);
    } else {
      /** add the value observer to the form */
      combinedObservers[el.name] = el.value$;
    }
    return combinedObservers;
  }, {});
  /**
   * Put in a default value of undefined, this signals 'no change yet'
   * Also add distinctUntilChanged here,
   * we don't need to fire off anything above if there are no
   * changes in an input, this takes in account that there might
   * be multiple inputs with the same name (radio's for example)
   * this makes sure the above logic will not go haywire.
   */
  return Object.entries(inputObservers).reduce((all, [name, obs]: [string, Observable<any>]) => {
    all[name] = obs.pipe(
      startWith(undefined),
      distinctUntilChanged()
    );
    return all;
  }, {});
}
