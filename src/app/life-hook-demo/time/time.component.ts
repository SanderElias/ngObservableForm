import {Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef} from '@angular/core';
import {MakeObservable} from '../life-hook-demo.component';
import {Observable} from 'rxjs';
import {timeInterval, tap} from 'rxjs/operators';

@Component({
  selector: 'app-time',
  template: `
    <p>time works! {{ time | async }}</p>
  `,
  styles: [],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @MakeObservable() @Input() time: Observable<string>;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {}
}
