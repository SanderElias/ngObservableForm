import {
  AfterContentInit,
  AfterViewInit,
  Directive,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  HostListener,
  ɵgetHostElement
} from '@angular/core';
import { Subject, concat } from 'rxjs';
import { first, map, tap, shareReplay } from 'rxjs/operators';

declare var ng: any;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[fillForm]'
})
export class FillFormDirective
  implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  private afterView$ = new Subject<void>();
  private afterContent$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private form: HTMLFormElement;
  fillForm: { [key: string]: any };

  @Input('fillForm')
  set _ffillForm(data: { [key: string]: any }) {
    this.fillForm = data;
    console.log('incomming', data);
    if (data) {
      Promise.resolve().then(() => {
        this.updateForm();
      });
    }
  }

  formFiller$ = concat(this.afterView$, this.afterContent$).pipe(
    first(),
    // map<void, any[]>(() => this.inputsCc.map(e => e)),
    map(() => ɵgetHostElement(this) as HTMLFormElement),
    tap(r => console.log('form', r)),
    tap(r => (this.form = r)),
    shareReplay(1)
  );

  // no need to unsubscribe, as I'm using 'first' and it will run to completion.
  private formSub = this.formFiller$.subscribe();

  constructor() {
    // console.log(this.constructor)
  }

  /** reset the form */
  @HostListener('reset', ['$event'])
  private resetForn(ev) {
    /**
     * the timout is needed to make sure the form is
     * filled after the DOM event cleared it.
     */
    setTimeout(() => this.updateForm(), 5);
  }

  /** update the form  with the current entries */
  private updateForm() {
    // for now this is ran just one, afer init.
    // I might add diffing later on, so we can update the form's values from the source.
    [...Object.entries(this.fillForm)].forEach(this.fillEntry.bind(this));
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.afterView$.next();
    this.afterView$.complete();
  }
  ngAfterContentInit() {
    this.afterContent$.next();
    this.afterContent$.complete();
  }

  /** Helper to fill a single entry */
  private fillEntry([key, val], index, arr) {
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
