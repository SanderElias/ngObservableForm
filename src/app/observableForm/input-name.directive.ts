import {
  Directive,
  HostListener,
  OnDestroy,
  ElementRef,
  Input
} from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[name], textarea[name], select[name]'
})
export class InputNameDirective implements OnDestroy {
  private destroy = new Subject<void>();
  private valueSource = new Subject<any>();
  private elm: HTMLElement = this.elRef.nativeElement;
  @Input('type') type: string;
  public value$ = this.valueSource.asObservable().pipe(takeUntil(this.destroy));

  @HostListener('input', ['$event'])
  private oninput(ev) {
    // console.log('inp', ev.target.value);
    console.log('type', this.type);
    switch (this.type) {
      case 'date':
        this.valueSource.next(ev.target.valueAsDate);
        break;
      case 'number':
        this.valueSource.next(+ev.target.value);
        break;
      case 'checkbox':
        this.valueSource.next(!!ev.target.checked);
        break;
      default:
        this.valueSource.next(ev.target.value);
    }
  }
  get name() {
    return this.elm.getAttribute('name');
  }

  constructor(private elRef: ElementRef) {}

  ngOnDestroy() {
    this.destroy.next();
  }
}
