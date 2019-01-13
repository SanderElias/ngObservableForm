import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap, shareReplay, first } from 'rxjs/operators';
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
  @ViewChild(ObservableFormDirective) myForm: ObservableFormDirective;
  formData$ = this.initView$.pipe(
    switchMap(() => this.myForm.formData$),
    tap(fd => console.log('fd', fd)),
  );

  formSub = this.formData$.subscribe(data => {
    this.progress =
      (Object.values(data).filter(i => i !== undefined).length /
        Object.keys(data).length) *
      100;
  });

  constructor() {}

  assignForm(o: Observable<any>) {
    // this.formData$ = o;
  }

  async doSave(ev: Event) {
    console.log('saving?')
    ev.preventDefault();
    const formData = await this.formData$.pipe(first()).toPromise().catch(() => ({}));
    console.log('formData', formData);
  }
}
