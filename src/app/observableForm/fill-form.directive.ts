import {
  Directive,
  Input,
  Optional,
  Host,
  ElementRef,
  OnInit,
  isDevMode,
  AfterContentInit,
  ContentChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { InputNameDirective } from './input-name.directive';
import { switchMap, tap, map, takeUntil, first } from 'rxjs/operators';
import { MONKEY_PATCH_KEY_NAME } from '@angular/core/src/render3/interfaces/context';
import { getHostElement } from '@angular/core/src/render3';

declare var ng: any;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[fillForm]'
})
export class FillFormDirective
  implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  private after$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private form: HTMLFormElement;

  @Input()
  fillForm: { [key: string]: any };

  formFiller$ = this.after$.pipe(
    first(),
    tap(r => console.log('after', r)),
    // map<void, any[]>(() => this.inputsCc.map(e => e)),
    map(() => getHostElement(this) as HTMLFormElement),
    tap(r => (this.form = r)),
    tap(() => {
      this.updateForm();
    }),
  );

  // no need to unsubscribe, as I'm using 'first' and it will run to completion.
  private formSub = this.formFiller$.subscribe();

  constructor(private gh: ) {
    // console.log(this.constructor)
  }

  private updateForm() {
    // for now this is ran just one, afer init.
    // I might add diffing later on, so we can update the form's values from the source.
    [...Object.entries(this.fillForm)].forEach(this.fillEntry.bind(this));
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.after$.next();
  }
  ngAfterContentInit(): void {
    this.after$.next();
  }

  fillEntry([key, val], index, arr) {
    // const form: HTMLFormElement = <any>{}; //this.form.nativeElement;
    const form = this.form;
    if (form === undefined) {
      // no form, nothing to do!
      // tslint:disable-next-line:no-unused-expression
      isDevMode() &&
        console.warn('tyring to fill a form on a non-form element?');
      return;
    }
    const target = form[key] as HTMLFormElement;
    if (target === undefined) {
      // no corrospodending field in form. ignore
      return;
    }
    if (target.type === 'checkbox') {
      if (!!val) {
        // ok, we have a true-like value, set check!
        target['checked'] = true;
      }
      return;
    }

    if (target.type === 'date') {
      if (val.constructor.name === 'Date') {
        const date: Date = val;
        // ok we have an date need to 'fix' for date input
        const newValue = `${date.getFullYear()}-${(
          date.getMonth() +
          1 +
          ''
        ).padStart(2, '0')}-${date.getDate()}`;
        target.value = newValue;
        // console.log(target.value, newValue);
        return;
      }
      // if it's not a Date, let it fall through to the normal assignment, doesn't hurt.
    }

    // surprisingly, this works for most of the types without anything fancy.
    // I was surprised it worked for radio-groups
    target.value = val;
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    this.destroy$.next();
  }
}

class destObs implements OnDestroy {
  destroy$ = new Subject<void>();
  ngOnDestroy() {this.destroy$.next()}
}
