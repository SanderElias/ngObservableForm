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
import { Subject, concat, from, ReplaySubject } from 'rxjs';
import { first, map, tap, shareReplay, take } from 'rxjs/operators';

declare var ng: any;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[fillForm]'
})
export class FillFormDirective
  implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  private afterView$ = new ReplaySubject<void>();
  private afterContent$ = new ReplaySubject<void>();
  private form: HTMLFormElement;
  fillForm: { [key: string]: any };
  formDataSub = new ReplaySubject(1);
  formData$ = this.formDataSub.pipe(
    tap(data => {
      // console.log('ff in tap', data);
      /**
       * I need to promise to take it to the end of the que
       * bcs the setup of the component is not done yet.
       */
      Promise.resolve().then(() => this.updateForm(data));
      // setTimeout(() => this.updateForm(data), 4);
    })
  );

  formFiller$ = concat(
    this.afterView$,
    this.afterContent$,
    this.formData$
  ).pipe(
    first(),
    map(() => ɵgetHostElement(this) as HTMLFormElement),
    tap(r => (this.form = r)),
    shareReplay(1)
  );

  private formSub = this.formFiller$.subscribe();

  @Input('fillForm') set _ffillForm(data: { [key: string]: any }) {
    if (data) {
      // console.log('ff input', data);
      this.formDataSub.next(data);
      /** I need this line to start off the thing, This is to work around a bug somewhere */
      setTimeout(async () => await this.formData$.pipe(take(1)).toPromise(), 0);
    }
  }
  constructor() {
    // console.log(this.constructor)
  }

  /** reset the form */
  @HostListener('reset', ['$event'])
  private async resetForm(ev) {
    const data = await this.formData$.pipe(take(1)).toPromise();
    /**
     * the timout is needed to make sure the form is
     * filled after the DOM event cleared it.
     */
    setTimeout(() => this.updateForm(data), 1);
  }

  /** update the form  with the current entries */
  private updateForm(data) {
    // console.log('updateForm called with ', data);
    // for now this is ran just one, after init.
    // I might add diffing later on, so we can update the form's values from the source.
    [...Object.entries(data)].forEach(this.fillEntry.bind(this));
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
    if (!form.elements.hasOwnProperty(key)) {
      // tslint:disable-next-line: no-unused-expression
      // isDevMode() &&
      //   console.warn(`property "${key}" doesn't exist in form.`);

      /** the key is not in the form */
      return;
    }
    const target = form[key] as HTMLFormElement;
    fillFormElement(target, val);
  }

  ngOnDestroy(): void {
    /** kill the one subscription. */
    this.formSub.unsubscribe();
  }
}

export function fillFormElement(target: HTMLFormElement, val: any) {
  if (target.type === 'checkbox') {
    if (!!val) {
      // ok, we have a true-like value, set check!
      target['checked'] = true;
    }
    return;
  }

  if (target.type === 'number') {
    if (!isNaN(Number(val))) {
      target.value = Number(val);
    } else {
      // tslint:disable-next-line:no-unused-expression
      isDevMode() &&
        console.warn(`

           --------------------------------------------------------
             Using a Number input name "${target.name}" for non-number value:"${val}"
           --------------------------------------------------------

      `);
    }
    return;
  }

  if (target.type === 'date') {
    if (val.constructor.name === 'Date') {
      const date: Date = val;
      // ok we have an date need to 'fix' for date input
      const newValue = `${(date.getFullYear() + '').padStart(4, '0')}-${(
        date.getMonth() +
        1 +
        ''
      ).padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')}`;
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
