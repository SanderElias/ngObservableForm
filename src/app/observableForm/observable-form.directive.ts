import {
  AfterViewInit,
  ContentChildren,
  Directive,
  EventEmitter,
  OnDestroy,
  HostListener,
  Output
} from '@angular/core';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, delay } from 'rxjs/operators';
import { InputNameDirective } from './input-name.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[observable]',
  exportAs: 'observableForm'
})
export class ObservableFormDirective implements AfterViewInit, OnDestroy {
  private afterView$ = new Subject<void>();
  @ContentChildren(InputNameDirective) private inputsCc;
  // tslint:disable-next-line:no-output-rename
  @Output('observable') exposeForm = new EventEmitter<Observable<any>>();

  formData$: Observable<any> = this.afterView$.pipe(
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

  initSub = this.afterView$
    .pipe(delay(500)) // delay it a bit so the form can "settle"
    .subscribe(() => this.exposeForm.emit(this.formData$));

  @HostListener('reset')
  onreset() {
    this.afterView$.next();
  }

  constructor() {}

  ngAfterViewInit() {
    this.afterView$.next();
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
