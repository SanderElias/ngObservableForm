import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap, shareReplay, first, take } from 'rxjs/operators';
import { ObservableFormDirective } from '../observableForm/observable-form.directive';
import { LifeCycleHook } from './lifeHook';

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
  @LifeCycleHook('afterContentInit') initView$: Observable<void>;
  @LifeCycleHook('onInit') onInitView$: Observable<void>;
  @LifeCycleHook('onDestroy') onDestroy$: Observable<void>;

  progress = 0;
  sample = sampleData;
  updates = {};
  @ViewChild(ObservableFormDirective) myForm: ObservableFormDirective;
  formData$ = this.initView$.pipe(
    switchMap(() => this.myForm.formData$),
    tap(data => (this.updates = data))
  );

  formSub = this.formData$.subscribe(data => {
    console.log('data from form', data);
    this.progress =
      (Object.values(data).filter(i => i !== undefined).length /
        Object.keys(data).length) *
      100;
    console.log(this.progress);
  });

  constructor() {}

  doSave(ev: Event) {
    ev.preventDefault();

    const changes = Object.entries(this.updates)
      .filter(([key, val]) => val)
      .reduce((r, [key, val]) => ({ ...r, [key]: val }), {});

    console.log('formData', changes);
  }


}

