import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.css']
})
export class FormDemoComponent implements OnInit {
  formData$: Observable<any>;
  progress = 0;
  constructor() {}

  assignForm(o: Observable<any>) {
    this.formData$ = o;
    console.log('hookup');
    this.formData$.subscribe(data => {
      this.progress =
        Object.values(data).filter(i => i !== undefined).length /
        Object.keys(data).length * 100;
      console.log(this.progress, data);
    });
  }

  ngOnInit() {}
  doSave(ev: Event) {
    ev.preventDefault();
    const form: HTMLFormElement = <any>ev.target;

    const data = Array.from(form.children)
      .filter((e: HTMLInputElement) => e.name)
      .reduce((obj, e: HTMLInputElement) => {
        obj[e.name] = e.value;
        return obj;
      }, {});

    console.log(data);
  }
}
