import { NgForOfContext } from '@angular/common';
import {
  Directive,
  Input,
  IterableDiffers,
  OnDestroy,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
  ViewRef
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { FillFormDirective } from './fill-form.directive';
import { ViewState } from '@angular/core/src/view';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ffArray][ffArrayFromProperty]'
})
export class FillFormArrDirective<T> implements OnDestroy {
  rowData: any[];
  propname$ = new Subject<string>();
  views = new Map<any, ViewRef>();

  testdata$ = combineLatest(this.ff.formData$, this.propname$).pipe(
    // tap(p => console.log('ff', p)),
    map(([data, prop]) => [...data[prop]]),
    tap(rowData => (this.rowData = rowData)),
    tap(rowData =>
      rowData.forEach(row => {
        if (!this.views.has(row)) {
          /** insert new rows */
          this.views.set(row, this.viewContainer.createEmbeddedView(this.template, { $implicit: row }));
        }
      })
    ),
    tap(rowData => {
      /** remove stale row */
      [...this.views.entries()].forEach(([row, currView]) => {
        if (!rowData.includes(row)) {
          const viewIndex = this.viewContainer.indexOf(currView);
          this.viewContainer.remove(viewIndex);
          this.views.delete(row);
        }
      });
    }),
    tap(p => console.log('ff', p)),
    shareReplay(1)
  );

  testSub = this.testdata$.subscribe();
  // tslint:disable-next-line:no-input-rename
  @Input('ffArrayFromProperty') set propname(x: string) {
    if (x) {
      this.propname$.next(x);
    } else {
      console.log('empty propname???');
    }
  }
  constructor(
    @SkipSelf() private ff: FillFormDirective,
    private viewContainer: ViewContainerRef,
    private template: TemplateRef<NgForOfContext<T>>,
    private differs: IterableDiffers
  ) {}

  ngOnDestroy() {
    // kill subscription
    this.testSub.unsubscribe();
  }
}
