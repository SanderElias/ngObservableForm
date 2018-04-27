import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.css']
})
export class FormDemoComponent implements OnInit {
  constructor() {}

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

    console.log(data)
  }
}
