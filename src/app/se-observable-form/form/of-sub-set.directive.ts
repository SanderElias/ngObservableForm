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
  EmbeddedViewRef,
  Optional
} from '@angular/core';
import { asyncScheduler, combineLatest, Observable, Subject, ReplaySubject } from 'rxjs';
import { filter, map, observeOn, shareReplay, tap } from 'rxjs/operators';
import { FillFormDirective, fillFormElement } from '../fill/fill-form.directive';
import { InputNameDirective } from '../input/input-name.directive';
import { findDirectives } from './findDirectives';
import { transformFormObervers } from './transformFormObervers';
import { gatherFormObservables } from './gaterFormObservables';
import { ObservableFormDirective } from './observable-form.directive';

const enum DataType {
  array,
  object
}
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ofSubGroup]'
})
export class OfSubSetDirective<T> implements AfterContentInit {
  /** helper to fire when the proname changes */
  private propName$ = new Subject<string>();
  /** helper to for the value$ */
  private _value = new Subject<any>();
  /** the viewref of the template */
  view: ViewRef;
  /** publuc observable, fires when any of the subfields change */
  value$ = this._value.asObservable();
  /** the name of the property this represents */
  name: string;
  /** this directive is always of type subset  */
  type = 'subSet';
  /** property to identify to which form/subform this input belongs to */
  public belongsTo: any;
  /** hold the parent of this subset */
  parent = this.oss || this.ffd
  /** provide data for children (if any) */
  formData$ = new ReplaySubject(1);

  @Input('ofSubGroup') set _cont(x: any) {
    if (x) {
      if (typeof x === 'string') {
        this.name = x;
        this.propName$.next(x);
      } else {
        throw new Error(`directive ofSubGroup needs a string and it received a ${typeof x}`);
      }
    }
  }

  // @Input('ofSubGroupPropName') set _name(x: string) {
  //   x && this.propName$.next(x);
  // }

  subData$: Observable<object | any[]> = combineLatest(this.propName$, this.parent.formData$).pipe(
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
    /** stop if it is an array */
    filter(data => !Array.isArray(data)),
    /** create (and destroy existing) view, as a side-effect */
    tap(data => {
      /** if there is an existing one, destroy it first */
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
    /** pay it forward to children (if any) */
    tap(data =>  this.formData$.next(data)),
    /** store the data for future reuse/sharing */
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  testsub = this.subData$.subscribe();

  constructor(
    @Optional() @SkipSelf() private ffd: FillFormDirective,
    @Optional() @SkipSelf() private oss: OfSubSetDirective<any>,
    private viewContainer: ViewContainerRef,
    private template: TemplateRef<NgForOfContext<T>>
  ) {
    // this.fillThem = this.fillThem.bind(this);
  }

  ngAfterContentInit() {
    // this.inputsCc.changes.subscribe(el => console.log(el))
  }

  fillThem(data: any) {
    const firstContainer = this.viewContainer.get(0) as EmbeddedViewRef<T>;
    const inputs = [] as InputNameDirective[];
    firstContainer.rootNodes.forEach((el: HTMLFieldSetElement) => {
      el.setAttribute('name', this.name);
      for (const [elm, dir] of findDirectives(el, [InputNameDirective, OfSubSetDirective] as any) as IterableIterator<
        [HTMLFormElement, any]
      >) {
        if (data.hasOwnProperty(elm.name)) {
          fillFormElement(elm, data[elm.name]);
          inputs.push(dir);
        }
      }
    });
    console.log('in', inputs);
    //.subscribe(this._value);
    // connect results to value$ output.
    transformFormObervers(gatherFormObservables(inputs)).subscribe(this._value);
    // this.ofd.addFormData({ [this.name]: transformFormObervers(gatherFormObservables(inputs)) });
  }
}
