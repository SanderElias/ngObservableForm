import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[name], textarea[name], select[name]'
})
export class InputNameDirective implements OnDestroy {
  /** subject to handle destroy */
  private destroy = new Subject<void>();
  /** subject to expose updates to the input */
  private valueSource = new Subject<any>();
  /** get the inputs name. Its always there as its part of the selector */
  @Input() name: string;
  /** get the inputs type. Optional, as none will be handled by the default handler */
  @Input() type: string;

  /**
   * Value$ is an observable that emits the value of
   * an input as soon as there are changes.
   */
  public value$ = this.valueSource.asObservable().pipe(
    /** make sure multiple events fire's don't mess up stuff. */
    debounceTime(50),
    /**
     * Note that we can't use distinctUntilChanged on this level
     * bcs the value of radio-buttons isn't related to its
     * changed status. We will take care of that in the
     * observable form upstream.
     */
    /** make sure it completes when the element gets destroyed. */
    takeUntil(this.destroy)
  );

  /**
   * Radio-buttons don't trigger change in a
   * particularly useful way. use a click for them.
   */
  @HostListener('click', ['$event']) private onClick(ev) {
    if (this.type !== 'radio') {
      /** only needed on radio buttons */
      return;
    }
    /**
     * handle radio button clicks, as the value stays the same,
     *  an onchange is unlikely to trigger switching radio
     * buttons. an upstream distinct will catch double's
     *
     * TODO: prevent double emit after form reset.
     */
    this.handleEvent(ev);
  }

  @HostListener('change', ['$event'])
  @HostListener('input', ['$event'])
  private handleEvent(ev) {
    switch (this.type) {
      case 'date':
        /** for date, use a real date, not the stringified version that seems allways off */
        this.valueSource.next(ev.target.valueAsDate);
        break;
      case 'number':
        /** Its s number, cast to a real number */
        this.valueSource.next(+ev.target.value);
        break;
      case 'checkbox':
        /** a checkbox is special, the checked properite holds its boolean value */
        this.valueSource.next(!!ev.target.checked);
        break;
      default:
        /** all other inputs, just emit the value of the input. */
        this.valueSource.next(ev.target.value);
    }
  }

  constructor() {}

  ngOnDestroy() {
    this.destroy.next();
  }
}
