import { NgForOfContext } from '@angular/common';
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  Input,
  OnDestroy,
  QueryList,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
  ɵgetDirectives as getDirectives,
  ɵgetHostElement as getHostElement,
  ViewRef
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { concatMap, delay, map, shareReplay, tap } from 'rxjs/operators';
import { FillFormDirective } from './fill-form.directive';
import { InputNameDirective } from './input-name.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ffArray][ffArrayFromProperty]'
})
export class FillFormArrDirective<T> implements OnDestroy, AfterContentInit {
  rowData: any[];
  contentInit$ = new Subject();
  propname$ = new Subject<string>();
  views = new Map<any, ViewRef>();
  inputs: InputNameDirective[];

  @ContentChildren(InputNameDirective, { descendants: true }) private inputsCc: QueryList<InputNameDirective>;

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
    tap(this.findInputs),
    shareReplay(1)
  );

  inputsSub = combineLatest(this.contentInit$, this.testdata$)
    .pipe(
      delay(1),
      tap(() => console.log('icc', this.inputsCc)),
      map(() => {
        const inputs: InputNameDirective[] = [];
        const siblings = getHostElement(this).parentNode.children;
        console.log('host', siblings);
        for (const sibling of Array.from(siblings)) {
          getDirectives(sibling)
            .filter(i => i instanceof InputNameDirective)
            .forEach((i:InputNameDirective) => inputs.push(i));
        }

        // const inputs = getDirectives(host.parentNode)//.filter(i => i instanceof InputNameDirective);
        console.log('inputs', inputs);
        return inputs;
      }),
      // concatMap(() => this.inputsCc.changes), //.pipe(startWith(this.inputsCc.toArray()))),
      tap((inputs: any) => (this.inputs = inputs)),
      tap(inp => console.log('ch', inp))
    )
    .subscribe();

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
    private template: TemplateRef<NgForOfContext<T>>
  ) {}

  findInputs(t) {
    console.log('find inputs', t);
    // this.inputsCc.subscribe(e => console.log(e));
  }

  ngAfterContentInit() {
    console.log('contentInit');
    this.contentInit$.next();
    this.contentInit$.complete();
  }

  ngOnDestroy() {
    // kill subscription
    this.testSub.unsubscribe();
    this.inputsSub.unsubscribe();
  }
}
