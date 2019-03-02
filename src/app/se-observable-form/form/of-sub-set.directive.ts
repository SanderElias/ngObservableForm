import { Directive, Input, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { FillFormDirective } from '../fill/fill-form.directive';
import { T_HOST } from '@angular/core/src/render3/interfaces/view';
import { tap } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'fieldset[name]'
})
export class OfSubSetDirective {
  private propName$ = new Subject<string>();

  @Input('name') private set _name(x: string) {
    console.log('setting name',x)
    if (x) {
      this.propName$.next(x);
    }
  }

  testsub = this.propName$
    .pipe(
      /** log incoming name */
      tap(n => console.log('name', n)),
      tap(() => {
        /** log ffd */
        console.log('parent', this.ffd);
      })
    )
    .subscribe();

  constructor(@SkipSelf() private ffd: FillFormDirective) {}
}
