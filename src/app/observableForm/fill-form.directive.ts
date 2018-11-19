import {
  Directive,
  Input,
  Optional,
  Host,
  ElementRef,
  OnInit,
  isDevMode
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[fillForm]'
})
export class FillFormDirective implements OnInit {
  @Input()
  fillForm: { [key: string]: any };
  constructor(
    @Optional()
    @Host()
    private form: ElementRef
  ) {
    console.log(this)
  }

  ngOnInit() {
    console.log(this.form);
    [...Object.entries(this.fillForm)].forEach(this.fillEntry.bind(this));
  }

  fillEntry([key, val], index, arr) {
    const form: HTMLFormElement = this.form.nativeElement;
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
        console.log('date', val, val.constructor.name);
        const date: Date = val;
        // ok we have an date need to 'fix' for date input
        const newValue = `${date.getFullYear()}-${(
          date.getMonth() +
          1 +
          ''
        ).padStart(2, '0')}-${date.getDate()}`;
        target.value = newValue;
        console.log(target.value, newValue);
        return;
      }
      // if it's not a Date, let it fall through to the normal assignment, doesn't hurt.
    }

    // surprisingly, this works for most of the types without anything fancy.
    // I was surprised it worked for radio-groups
    target.value = val;
  }
}
