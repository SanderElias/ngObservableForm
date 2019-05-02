import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { dropUndefined } from '../simple-form/dropUndefined';
import { FetchFormObservable } from './FetchFormObservable';

const sampleData = {
  name: 'Sander Elias',
  email: 'ThisIs@not.me',
  terms: true,
  contact: 'phone',
  volume: 80,
  favoredChoc: 'milk',
  birth: new Date('2018-08-12T00:00:00.000Z'),
  phone: '62135467',
  desc: 'Blah\n\nBlah\nDont know.',
  option: 'Option 2.2',
  weight: 75
};

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FormDemoComponent implements OnInit {
  @FetchFormObservable() formData$: Observable<any>;

  changedRatio = 0;
  sample = sampleData;
  updates = {};

  formSub = this.formData$
    .pipe(
      /** assign data to local properties for easy access */
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

  ngOnInit() {
    /** for demo purposes, list all updates */
    this.formData$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(data => console.log(dropUndefined(data)));
  }

  doSave(changes) {
    console.log('formData', changes);
  }
}
