// tslint:disable: no-unused-expression
import { NgForOfContext } from '@angular/common';
import {
  Directive,
  Input,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
  ViewRef,
  ContentChildren,
  AfterContentInit,
  QueryList,
  ɵgetLContext as getContext,
  ɵgetHostElement as getHostElement,
  ɵgetDirectives as getDirectives,
  EmbeddedViewRef
} from '@angular/core';
import { asyncScheduler, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, observeOn, shareReplay, tap } from 'rxjs/operators';
import {
  FillFormDirective,
  fillFormElement
} from '../fill/fill-form.directive';
import { InputNameDirective } from '../input/input-name.directive';
import { gatherFormObservables } from './observable-form.directive';

const enum DataType {
  array,
  object
}
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ofSubGroup]'
})
export class OfSubSetDirective<T> implements AfterContentInit {
  private propName$ = new Subject<string>();
  dataType: DataType;
  view: ViewRef;
  subsetData$ : Observable<any>

  @Input('ofSubGroup') set _cont(x: any) {
    console.log('grou', x, getHostElement(this).getAttribute('ofSubGroup'));
  }

  @Input('ofSubGroupPropName') set _name(x: string) {
    console.log('osname', x);
    x && this.propName$.next(x);
  }

  subData$: Observable<object | any[]> = combineLatest(
    this.propName$,
    this.ffd.formData$
  ).pipe(
    /**
     * use async scheduler to take it to the next cycle.
     * this prevents sub inputs from being added to form observer itself
     */
    observeOn(asyncScheduler),
    /** extract the property from the formData */
    map(([prop, data]) => data[prop]),
    /** only progress if there is actual data */
    filter(Boolean),
    /** stop if its not an "object" */
    filter(data => typeof data === 'object'),
    /** side-effect to store datatype */
    tap(data => {
      this.dataType = Array.isArray(data) ? DataType.array : DataType.object;
    }),
    /** create (and destroy existing) view, as a side-effect */
    tap(data => {
      /** if there is an existing one, destroy it first */
      // setTimeout(() => {
      /** move to next frame, keep contents out of parent form */
      this.view && this.viewContainer.remove();
      this.view = this.viewContainer.createEmbeddedView(this.template, {
        // $implicit: data,
        ...data
        // data
      });
      // },0)
    }),
    // observeOn(asyncScheduler),
    tap(data => this.fillThem(data)),
    /** store the data for future reuse/sharing */
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  testsub = this.subData$.subscribe();

  constructor(
    @SkipSelf() private ffd: FillFormDirective,
    private viewContainer: ViewContainerRef,
    private template: TemplateRef<NgForOfContext<T>>
  ) {
    // this.fillThem = this.fillThem.bind(this);
  }

  ngAfterContentInit() {
    // this.inputsCc.changes.subscribe(el => console.log(el))
  }

  fillThem(data: any) {
    const x = this.viewContainer.get(0) as EmbeddedViewRef<T>;
    const el = this.viewContainer.element.nativeElement as HTMLElement;
    const inputs = [] as InputNameDirective[];
    x.rootNodes.forEach(el => {
      for (const [elm, dir] of findDirectives(
        el,
        InputNameDirective
      ) as IterableIterator<[HTMLFormElement, InputNameDirective]>) {
        if (data.hasOwnProperty(elm.name)) {
          fillFormElement(elm, data[elm.name]);
          inputs.push(dir);
        }
      }
    });
    console.log('in', inputs)
    const fi = gatherFormObservables( inputs)
    combineLatest(Object.values(fi)).pipe(
      /** log */
      tap(inp => console.log('i',inp))
    ).subscribe()
  }
}

function* findDirectives(
  elm: HTMLElement,
  dir: any
): IterableIterator<[HTMLElement, any]> {
  const outerDirective = getDirectives(elm).find(i => i instanceof dir);
  if (outerDirective) {
    yield [elm as HTMLElement, outerDirective];
  }

  for (const item of (elm.children as unknown) as HTMLElement[]) {
    const directive = getDirectives(item).find(i => i instanceof dir);
    if (directive) {
      yield [item as HTMLElement, directive];
    }
    if (item.children.length > 0) {
      yield* findDirectives(item, dir);
    }
  }
}
