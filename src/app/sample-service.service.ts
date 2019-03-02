import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';
import {
  mergeMap,
  map,
  shareReplay,
  take,
  tap,
  flatMap,
  combineLatest
} from 'rxjs/operators';
import { PeopleRoot } from './PeopleRoot.interface';

@Injectable({
  providedIn: 'root'
})
export class SampleServiceService {
  private load$ = new BehaviorSubject<undefined>(undefined);

  people$ = this.load$.pipe(
    // Fire on flush
    /** switch to actual http */
    flatMap(() => this.http.get<PeopleRoot>(`https://swapi.co/api/people/`)),
    /** some cleanup stuff */
    map(root => root.results),
    tap(() => console.log('http loaded')),
    /** make it retain its buffer (new syntax makes sure it doesn't get dropped on 0 subscribers.) */
    shareReplay({ bufferSize: 1, refCount: false }),
    /** make it behave as a 'normal' http */
    tap(() => console.log('buffer result used')),
    take(1)
  );



  constructor(private http: HttpClient) {}

  flushCache() {
    this.load$.next(undefined);
  }
}
