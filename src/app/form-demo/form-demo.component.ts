import {
  AfterContentChecked,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ObservableFormDirective } from '../observableForm/observable-form.directive';
import { switchMap } from 'rxjs/operators';

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
export class FormDemoComponent implements OnInit {
  progress = 0;
  init$ = new Subject<void>();
  sample = sampleData;
  @ViewChild(ObservableFormDirective)
  myForm: ObservableFormDirective;
  formData$ = this.init$.pipe(
    switchMap(() => this.myForm.formData$)
  );

  formSub = this.formData$.subscribe(data => {
    this.progress =
      (Object.values(data).filter(i => i !== undefined).length /
        Object.keys(data).length) *
      100;
    console.log(this.progress, data);
  });

  constructor() {}

  assignForm(o: Observable<any>) {
    // this.formData$ = o;
  }

  ngOnInit() {
    this.init$.next();
  }

  doSave(ev: Event) {
    ev.preventDefault();
    const form: HTMLFormElement = <any>ev.target;

    const data = Array.from(form.children)
      .filter((e: HTMLInputElement) => e.name)
      .reduce((obj, e: HTMLInputElement) => {
        obj[e.name] = e.value;
        return obj;
      }, {});
  }
}
