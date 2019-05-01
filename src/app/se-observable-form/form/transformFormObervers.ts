import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FormObservables } from './FormObservables.interface';

export function transformFormObervers(formObservables: FormObservables) {
  /** make it update on every input firing off */
  return combineLatest(Object.values(formObservables)).pipe(
    /** the result is an array */
    map(results =>
      /** reduce it back to a json-like data structure */
      Object.keys(formObservables).reduce((t, key, i) => ({ ...t, [key]: results[i] }), {})
    ),
    // tap(res => console.log(res))
  );
}
