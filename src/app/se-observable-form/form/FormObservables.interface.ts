import { Observable } from 'rxjs';

export interface FormObservables {
  [x: string]: Observable<any>;
}
