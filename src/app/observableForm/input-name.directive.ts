import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';


@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[name], textarea[name], select[name]'
})
export class InputNameDirective implements OnDestroy {
  private destroy = new Subject<void>();
  private valueSource = new Subject<any>();
  // private elm = this.elRef.nativeElement;O
  @Input() name: string;
  // tslint:disable-next-line:no-input-rename
  @Input('type') type: string;
  public value$ = this.valueSource.asObservable().pipe(
    takeUntil(this.destroy),
    distinctUntilChanged()
  );

  @HostListener('change', ['$event'])
  @HostListener('input', ['$event'])
  private oninput(ev) {
    // console.log(
    //   'inp',
    //   this.name,
    //   this.type,
    //   ev.target.value,
    //   ev.target.checked
    // );
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

  constructor() {}

  ngOnDestroy() {
    this.destroy.next();
  }
}
