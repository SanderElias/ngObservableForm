import { Directive, HostListener, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[name], textarea[name]'
})
export class InputNameDirective implements OnDestroy {
  private destroy = new Subject<void>();
  private valueSource = new Subject<any>();
  public value$ = this.valueSource.asObservable().pipe(takeUntil(this.destroy));

  @HostListener('input', ['$event'])
  oninput(ev) {
    console.log('inp', ev.target.value);
    this.valueSource.next(ev.value)
  }

  constructor() {}

  ngOnDestroy() {
    this.destroy.next();
  }
}
