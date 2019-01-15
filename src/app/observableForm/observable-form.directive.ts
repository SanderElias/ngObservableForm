import {
  AfterContentInit,
  AfterViewInit,
  ContentChildren,
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output
} from '@angular/core';
import { combineLatest, merge, Observable, ReplaySubject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  throttleTime
} from 'rxjs/operators';
import { InputNameDirective } from './input-name.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[observable]',
  exportAs: 'observableForm'
})
export class ObservableFormDirective
  implements AfterViewInit, AfterContentInit, OnDestroy {
  private init$ = new ReplaySubject<void>(1);
  /**
   * TODO: considder adding viewChildren.
   * Perhaps, when there is a compelling use-case
   * adittional info, in this spirit both afterXInit events are already handled.
   */
  @ContentChildren(InputNameDirective, { descendants: true }) private inputsCc;
  // tslint:disable-next-line:no-output-rename
  @Output('observable') private exposeForm = new EventEmitter<Observable<any>>();

  formData$: Observable<any> = this.init$.pipe(
    throttleTime(100), // make sure it doesn't refire to rapidly
    /** use an helper to get the observables from the inputs */
    map(() => this.gatherFormObservables()),
    switchMap(formObservables =>
      /** make it update on every input firing off */
      combineLatest(Object.values(formObservables)).pipe(
        /** the result is an array */
        map(results =>
          /** reduce it back to a json-like data structure */
          Object.keys(formObservables).reduce(
            (t, key, i) => ({ ...t, [key]: results[i] }),
            {}
          )
        )
      )
    ),
    /** make sure we can share/reuse this data by keepin an 'buffer' */
    shareReplay(1)
  );

  /**
   * subscribe to init, so we can export the formData$ observable
   * with the eventemitter. this might be subject to change.
   */
  private initSub = this.init$.subscribe(() => this.exposeForm.emit(this.formData$));

  /** listen to the reset events on the form, and just make init refire to 'reset' all data */
  @HostListener('reset')
  private onreset() {
    this.init$.next();
  }

  /** constructor */
  constructor() {}

  /** fire off an init$ event on contentInit */
  ngAfterContentInit() {
    this.init$.next();
  }

  /** fire off an init$ event on viewInit */
  ngAfterViewInit() {
    this.init$.next();
  }

  /** unsubscibe the single subscription on destroy */
  ngOnDestroy(): void {
    this.initSub.unsubscribe();
  }

  private gatherFormObservables() {
    /**
     * Gather all available inputs into a single object
     *   { [formEntryName]: Observevanle<inputType>}
     * this mathes the json structure of the model
     */
    const inputObservers = this.inputsCc.reduce((all, el) => {
      if (all[el.name]) {
        // multiple inputs with same name, probably radiobuttons,
        // merge the results, so only the latest one will "surface"
        all[el.name] = merge(all[el.name], el.value$);
      } else {
        all[el.name] = el.value$;
      }
      // console.log('all', all);
      return all;
    }, {});

    /**
     * Put in a default value of undefined, this signals 'no change yet'
     * Also add distinctUntilChanged here,
     * we don't need to fire off anything above if there are no
     * changes in an input, this takes in account that there might
     * be multiple inputs with the same name (radio's for example)
     * this makes sure the above logic will not go haywire.
     */
    return Object.entries(inputObservers).reduce(
      (all, [name, obs]: [string, Observable<any>]) => {
        all[name] = obs.pipe(
          startWith(undefined),
          distinctUntilChanged()
        );
        return all;
      },
      {}
    );
  }
}
