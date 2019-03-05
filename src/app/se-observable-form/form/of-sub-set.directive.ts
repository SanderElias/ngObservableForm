// tslint:disable: no-unused-expression
import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  Input,
  Optional,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
  ViewRef
} from '@angular/core';
import {
  asyncScheduler,
  combineLatest,
  Observable,
  ReplaySubject,
  Subject
} from 'rxjs';
import { filter, map, observeOn, shareReplay, take, tap } from 'rxjs/operators';
import {
  FillFormDirective,
  fillFormElement
} from '../fill/fill-form.directive';
import { InputNameDirective } from '../input/input-name.directive';
import { findNewDirectives } from './findDirectives';
import { FormObservables } from './FormObservables.interface';
import { gatherFormObservables } from './gatherFormObservables';
import { transformFormObervers } from './transformFormObervers';

const enum DataType {
  array,
  object
}
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ofSubGroup]'
})
export class OfSubSetDirective implements AfterContentInit {
  /** helper to fire when the proname changes */
  private propName$ = new Subject<string>();
  /** helper to for the value$ */
  private _value = new Subject<any>();
  /** the viewref of the template */
  view: ViewRef;
  /** public observable, fires when any of the subFields change */
  value$ = this._value.asObservable();
  /** the name of the property this represents */
  name: string;
  /** this directive is always of type subset  */
  type = 'subSet';
  /** property to identify to which form/subform this input belongs to */
  public belongsTo: any;
  /** hold the parent of this subset */
  parent = this.oss || this.ffd;
  /** provide data for children (if any) */
  formData$ = new ReplaySubject(1);

  @Input('value') private set _valueIncomming(x) {
    console.log(this.type, x);
  }

  @Input('ofSubGroup') set _cont(x: any) {
    if (x) {
      if (typeof x === 'string') {
        this.name = x;
        this.propName$.next(x);
        console.log(`fieldset added for ${x}`);
      } else {
        throw new Error(
          `directive ofSubGroup needs a string and it received a ${typeof x}`
        );
      }
    }
  }

  // @Input('ofSubGroupPropName') set _name(x: string) {
  //   x && this.propName$.next(x);
  // }

  subData$: Observable<object | any[]> = combineLatest(
    this.propName$,
    this.parent.formData$
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
    /** stop if it is an array */
    filter(data => !Array.isArray(data)),
    /** create (and destroy existing) view, as a side-effect */
    tap(data => {
      /** if there is an existing one, destroy it first */
      this.view && this.vcr.remove();
      this.view = this.vcr.createEmbeddedView(this.template, {
        // $implicit: data,
        ...data
        // data
      });
      // },0)
    }),
    // observeOn(asyncScheduler),
    tap(data => this.fillThem(data)),
    /** pay it forward to children (if any) */
    tap(data => this.formData$.next(data)),
    /** template may contain stuff that needs a CDR cycle */
    tap(() => Promise.resolve().then(() => this.cdr.detectChanges())),
    /** store the data for future reuse/sharing */
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  testsub = this.subData$.subscribe();

  constructor(
    @Optional() @SkipSelf() private ffd: FillFormDirective,
    @Optional() @SkipSelf() private oss: OfSubSetDirective,
    private cdr: ChangeDetectorRef,
    private vcr: ViewContainerRef,
    private template: TemplateRef<any>
  ) {
    // this.fillThem = this.fillThem.bind(this);
  }

  ngAfterContentInit() {
    // this.inputsCc.changes.subscribe(el => console.log(el))
  }

  fillThem(data: any) {
    const firstContainer = this.vcr.get(0) as EmbeddedViewRef<any>;
    const inputs = [] as InputNameDirective[];
    firstContainer.rootNodes.forEach((el: HTMLFieldSetElement) => {
      el.setAttribute('name', this.name);
      for (const [elm, dir] of findNewDirectives(
        el,
        [InputNameDirective, OfSubSetDirective],
        this
      ) as IterableIterator<[HTMLFormElement, any]>) {
        if (data.hasOwnProperty(elm.name)) {
          fillFormElement(elm, data[elm.name]);
        }
        inputs.push(dir);
      }
    });
    setTimeout(() => this.hookUpObservers(),1000)
  }

  hookUpObservers() {
    const firstContainer = this.vcr.get(0) as EmbeddedViewRef<any>;
    const inputs = [] as InputNameDirective[];
    firstContainer.rootNodes.forEach((el: HTMLFieldSetElement) => {
      for (const [elm, dir] of findNewDirectives(
        el,
        [InputNameDirective, OfSubSetDirective],
        undefined
      )) {
        inputs.push(dir);
        console.log('hookup', dir.name, dir.value$)
      }
    });
    console.log('in', inputs);
    //.subscribe(this._value);
    // connect results to value$ output.
    transformFormObervers(gatherFormObservables(inputs)).subscribe(this._value);
    // this.ofd.addFormData({ [this.name]: transformFormObervers(gatherFormObservables(inputs)) });
  }

  async addFormData(fo: FormObservables) {
    const start = await this._value.pipe(take(1)).toPromise();
    this._value.next({ ...start, ...fo });
  }
}
