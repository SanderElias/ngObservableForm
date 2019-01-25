import {
  AfterContentInit,
  AfterViewInit,
  ContentChildren,
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { combineLatest, concat, merge, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  throttleTime,
  takeUntil
} from 'rxjs/operators';
import { InputNameDirective } from './input-name.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[observable]',
  exportAs: 'observableForm'
})
export class ObservableFormDirective
  implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  view$ = new Subject<void>();
  content$ = new Subject<void>();
  init$ = new Subject<void>();
  destroy$ = new Subject<void>();
  /**
   * TODO: considder adding viewChildren.
   * Perhaps, when there is a compelling use-case
   * additional info, in this spirit both afterXInit events are already handled.
   */
  @ContentChildren(InputNameDirective, { descendants: true }) private inputsCc;
  // tslint:disable-next-line:no-output-rename
  @Output('observable') private exposeForm = new EventEmitter<
    Observable<any>
  >();

  formData$: Observable<any> = this.init$.pipe(
    throttleTime(200), // make sure it doesn't refire to rapidly
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
    shareReplay(1),
    takeUntil(this.destroy$)
  );

  /**
   * subscribe to init, so we can export the formData$ observable
   * with the eventemitter. this might be subject to change.
   */
  private initSub = this.init$.subscribe(() =>
    this.exposeForm.emit(this.formData$)
  );

  /** listen to the reset events on the form, and just make init refire to 'reset' all data */
  @HostListener('reset')
  private onreset() {
    this.init$.next();
  }

  /** constructor */
  constructor() {}

  ngOnInit() {
    // fire off init when view and content are done, everything completes, no unsub.
    concat(this.view$, this.content$).subscribe(() =>
      /**
       * make sure the init is fired in the next microTask.
       * This is needed bcs when it fires, not all subscriptions might
       * be active yet.
       */
      Promise.resolve().then(() => this.init$.next())
    );
  }

  /** fire&complete  */
  ngAfterContentInit() {
    this.content$.next();
    this.content$.complete();
  }

  /** fire&complete  */
  ngAfterViewInit() {
    this.view$.next();
    this.view$.complete();
  }

  /** unsubscribe the single subscription on destroy */
  ngOnDestroy(): void {
    this.initSub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Gather all available inputs into a single object
   *   { [formEntryName]: Observable<inputType>}
   * this mathes the json structure of the model
   */
  private gatherFormObservables() {
    const inputObservers = this.inputsCc.reduce((combinedObservers, el) => {
      if (combinedObservers[el.name]) {
        /**
         * The same name already exists, merge the additional
         * one so it is exposed as a single observable.
         * note that only the last one that fire's wins.
         * This works well for radio buttons. No other inputs should get the same name
         */
        combinedObservers[el.name] = merge(
          combinedObservers[el.name],
          el.value$
        );
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
