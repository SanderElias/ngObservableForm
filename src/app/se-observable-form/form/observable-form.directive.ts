import {
  AfterContentInit,
  AfterViewInit,
  ContentChildren,
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ɵgetHostElement as getHostElement,
  QueryList
} from '@angular/core';
import { concat, Observable, Subject, ReplaySubject } from 'rxjs';
import { map, shareReplay, switchMap, take, takeUntil, throttleTime, tap, mergeMap } from 'rxjs/operators';
import { isEmptyObject } from 'src/utils/isObjectEmpty';
import { InputNameDirective } from '../input/input-name.directive';
import { transformFormObervers } from './transformFormObervers';
import { gatherFormObservables } from './gaterFormObservables';
import { FormObservables } from './FormObservables.interface';
import { findComponentView } from '@angular/core/src/render3/util/view_traversal_utils';
import { findDirectives } from './findDirectives';
import { OfSubSetDirective } from './of-sub-set.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[observable]',
  exportAs: 'observableForm'
})
export class ObservableFormDirective implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  view$ = new Subject<void>();
  content$ = new Subject<void>();
  init$ = new Subject<void>();
  destroy$ = new Subject<void>();
  innerData$ = new ReplaySubject<FormObservables>(1);
  /**
   * TODO: considder adding viewChildren.
   * Perhaps, when there is a compelling use-case
   * additional info, in this spirit both afterXInit events are already handled.
   */
  @ContentChildren(InputNameDirective, { descendants: true }) private inputsCc: QueryList<InputNameDirective>;
  @ContentChildren(OfSubSetDirective, { descendants: true }) private subsets: QueryList<InputNameDirective>;
  // tslint:disable-next-line:no-output-rename
  @Output('observable') private exposeForm = new EventEmitter<Observable<any>>();

  // tslint:disable-next-line:no-output-rename
  @Output() save = new EventEmitter();

  formData$: Observable<any> = this.init$.pipe(
    throttleTime(200), // make sure it doesn't refire to rapidly
    /** use an helper to get the observables from the inputs */
    tap(() => {
      const ChildInputs = [];
      // ...findDirectives(getHostElement(this) as HTMLElement, [InputNameDirective, OfSubSetDirective])
      // ].map(([elm, directive]) => directive as InputNameDirective);
      this.inputsCc.forEach(i => ChildInputs.push(i));
      console.log('elms', ChildInputs);
      this.innerData$.next(gatherFormObservables(ChildInputs));
    }),
    switchMap(() => this.innerData$),
    switchMap(transformFormObervers),
    /** make sure we can share/reuse this data by keepin an 'buffer' */
    shareReplay(1),
    /** make sure all is terminated  */
    takeUntil(this.destroy$)
  );

  dummy = this.init$.pipe(mergeMap(() => this.inputsCc.changes.pipe(tap(c => console.log('changes', c))))).subscribe();

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
  @HostListener('submit', ['$event']) private async handleSubmit(ev: MouseEvent) {
    try {
      // tslint:disable-next-line:no-unused-expression
      ev && ev.preventDefault();
      // tslint:disable-next-line:no-unused-expression
      ev && ev.stopPropagation();
      const formData = Object.entries(await this.formData$.pipe(take(1)).toPromise())
        .filter(r => r[1] !== undefined)
        .reduce((r, [key, val]) => ({ ...r, [key]: val }), {});
      // tslint:disable-next-line:no-unused-expression
      !isEmptyObject(formData) && this.save.emit(formData);
    } catch (e) {
      /** stubb */
    }
  }

  /** constructor */
  constructor() {}

  async addFormData(fo: FormObservables) {
    const start = await this.innerData$.pipe(take(1)).toPromise();
    this.innerData$.next({ ...start, ...fo });
  }

  ngOnInit() {
    // fire off init when view and content are done, everything completes, no unsub.
    concat(this.view$, this.content$).subscribe(() => {
      /**
       * make sure the init is fired in the next microTask.
       * This is needed bcs when it fires, not all subscriptions might
       * be active yet.
       */
      Promise.resolve().then(() => this.init$.next());
      /** subscribe so the observables are readily availble when needed. */
      this.formData$.subscribe();
    });
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
}
