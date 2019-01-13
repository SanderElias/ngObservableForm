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
import { debounceTime, delay, map, startWith, switchMap, throttleTime } from 'rxjs/operators';
import { InputNameDirective } from './input-name.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[observable]',
  exportAs: 'observableForm'
})
export class ObservableFormDirective
  implements AfterViewInit, AfterContentInit, OnDestroy {
  private init$ = new ReplaySubject<void>(1);
  @ContentChildren(InputNameDirective) private inputsCc;
  // tslint:disable-next-line:no-output-rename
  @Output('observable') exposeForm = new EventEmitter<Observable<any>>();

  formData$: Observable<any> = this.init$.pipe(
    throttleTime(100), // make sure it doesn't refire to rapidly
    map(() => this.gatherFormObservables()),
    switchMap(formObservables =>
      combineLatest(Object.values(formObservables)).pipe(
        map(results =>
          Object.keys(formObservables).reduce(
            (t, key, i) => ({ ...t, [key]: results[i] }),
            {}
          )
        )
      )
    )
  );

  initSub = this.init$
    // .pipe(delay(250)) // delay it a bit so the form can "settle"
    .subscribe(() => this.exposeForm.emit(this.formData$));

  @HostListener('reset')
  onreset() {
    this.init$.next();
  }

  constructor() {}

  ngAfterContentInit() {
    this.init$.next();
  }

  ngAfterViewInit() {
    this.init$.next();
  }

  ngOnDestroy(): void {
    this.initSub.unsubscribe();
  }

  private gatherFormObservables() {
    return this.inputsCc.reduce((all, el) => {
      if (all[el.name]) {
        // multiple inputs with same name, probably radiobuttons,
        // merge the results, so only the latest one will "surface"
        all[el.name] = merge(all[el.name], el.value$);
      } else {
        all[el.name] = el.value$.pipe(startWith(undefined));
      }
      console.log('all', all);
      return all;
    }, {});
  }
}
