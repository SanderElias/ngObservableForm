import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ViewChildren,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { combineLatest, Observable, merge } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { InputNameDirective } from './input-name.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[observable]',
  exportAs: 'observableForm'
})
export class ObservableFormDirective implements AfterViewInit {
  @ViewChildren(InputNameDirective) private inputsVc;
  @ContentChildren(InputNameDirective) private inputsCc;
  // tslint:disable-next-line:no-output-rename
  @Output('observable') exposeForm = new EventEmitter<Observable<any>>();
  formData$: Observable<any>;

  @HostListener('reset') onreset() {
    console.log('resetting form');
    this.ngAfterViewInit();
  }
  constructor() {}

  ngAfterViewInit() {
    // console.log('inputs', this.inputsCc, this.inputsVc);
    // this.inputsCc
    const res = this.inputsCc.reduce((all, el) => {
      if (all[el.name]) {
        // multiple inputs with same name, probably radiobuttons,
        // merge the results, so only the latest one will "surface"
        all[el.name] = merge(all[el.name], el.value$);
      } else {
        all[el.name] = el.value$.pipe(startWith(undefined));
      }
      return all;
    }, {});

    this.formData$ = combineLatest(Object.values(res)).pipe(
      map(results =>
        Object.keys(res).reduce(
          (t, key, i) => ({ ...t, [key]: results[i] }),
          {}
        )
      )
    );
    this.exposeForm.emit(this.formData$);
  }
}
