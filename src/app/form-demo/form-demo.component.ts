import { Component, ViewEncapsulation, ContentChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FetchFormObservable } from './FetchFormObservable';
import { ObservableFormDirective } from '../se-observable-form/form/observable-form.directive';

const sampleData = {
  name: 'Sander Elias',
  email: 'sanderelias@gmail.com',
  terms: true,
  contact: 'phone',
  volume: 80,
  favoredChoc: 'milk',
  birth: new Date('2018-08-12T00:00:00.000Z'),
  phone: '624771946',
  desc: 'Blah\n\nBlah\nDont know.',
  option: 'Option 2.2',
  weight: 88
};

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FormDemoComponent {
  @FetchFormObservable() formData$: Observable<any>;

  // @ContentChildren(ObservableFormDirective) ObservableForms;

  changedRatio = 0;
  sample = sampleData;
  updates = {};

  formSub = this.formData$
    .pipe(
      /** assign data to local properie for easy access */
      tap(data => (this.updates = data)),
      /** silly sample, calculate the change rate */
      tap(
        data =>
          (this.changedRatio = Math.ceil(
            (Object.values(data).filter(i => i !== undefined).length /
              Object.keys(data).length) *
              100
          ))
      )
    )
    .subscribe();

  constructor() {}

  doSave(ev: Event) {
    ev.preventDefault();

    const changes = Object.entries(this.updates)
      .filter(([key, val]) => val)
      .reduce((r, [key, val]) => ({ ...r, [key]: val }), {});

    console.log('formData', changes);
  }
}
