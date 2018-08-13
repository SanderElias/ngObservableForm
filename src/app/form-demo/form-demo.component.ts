import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ObservableFormDirective } from '../observableForm/observable-form.directive';

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
  weigth: 88
};

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.css']
})
export class FormDemoComponent implements OnInit, AfterContentChecked {
  formData$: Observable<any>;
  progress = 0;
  sample = sampleData;
  @ViewChild('observableForm')
  myForm: ObservableFormDirective;
  constructor() {}

  assignForm(o: Observable<any>) {
    this.formData$ = o;
    console.log('hookup');
    this.formData$.subscribe(data => {
      this.progress =
        (Object.values(data).filter(i => i !== undefined).length /
          Object.keys(data).length) *
        100;
      console.log(this.progress, data);
    });
  }

  ngOnInit() {
    console.log('myForm', this.myForm);
  }

  ngAfterContentChecked() {
    //Called after every check of the component's or directive's content.
    console.log('myForm', this.myForm);
    //Add 'implements AfterContentChecked' to the class.
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
