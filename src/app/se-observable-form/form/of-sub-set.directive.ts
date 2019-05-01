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
  ViewRef,
  OnDestroy
} from '@angular/core';
import { asyncScheduler, combineLatest, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { filter, map, observeOn, shareReplay, take, tap } from 'rxjs/operators';
import { FillFormDirective, fillFormElement } from '../fill/fill-form.directive';
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
  selector: '[of-name]'
})
export class OfSubSetDirective implements OnDestroy {
  /** helper to fire when the proname changes */
  private propName$ = new Subject<string>();
  /** helper to for the value$ */
  private _value = new Subject<any>();
  /** the viewref of the template */
  private view: ViewRef;
  /** public observable, fires when any of the subFields change */
  value$ = this._value.asObservable();
  /** the name of the property this represents */
  name: string;
  /** this directive is always of type subset  */
  type = 'subSet';
  /** hold the parent of this subset */
  private parent = this.oss || this.ffd;
  /** provide data for children (if any) */
  formData$ = new ReplaySubject(1);
  private hookupSubscription: Subscription;

  @Input('of-name') set _cont(x: any) {
    if (x) {
      if (typeof x === 'string') {
        this.name = x;
        this.propName$.next(x);
        console.log(`fieldset added for ${x}`);
      } else {
        throw new Error(`directive ofSubGroup needs a string and it received a ${typeof x}`);
      }
    }
  }

  private fieldSetData$: Observable<object | any[]> = combineLatest(this.propName$, this.parent.formData$).pipe(
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
        ...data
      });
    }),
    /** use a side-effect to fill all sub-fields */
    tap(data => this.fillThem(data)),
    /** pay it forward to children (if any) */
    tap(data => this.formData$.next(data)),
    /** template may contain stuff that needs a CDR cycle */
    tap(() => Promise.resolve().then(() => this.cdr.detectChanges())),
    /** store the data for future reuse/sharing */
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  /** start off  */
  fieldDataSubscription = this.fieldSetData$.subscribe();

  constructor(
    @Optional() @SkipSelf() private ffd: FillFormDirective,
    @Optional() @SkipSelf() private oss: OfSubSetDirective,
    private cdr: ChangeDetectorRef,
    private vcr: ViewContainerRef,
    private template: TemplateRef<any>
  ) {}

  /** take the incomming data, and distribute it to the needed components */
  fillThem(data: any) {
    /** get the container (there is max 1) */
    const firstContainer = this.vcr.get(0) as EmbeddedViewRef<any>;
    /** keep track of the sub-fields */
    const inputs = [] as InputNameDirective[];
    /** iterate over the rootnodex, usually just 1, but one never knows. */
    firstContainer.rootNodes.forEach((el: HTMLFieldSetElement) => {
      /** add the name attribute to the DOM, mostly a cosmetic debugging aid. */
      el.setAttribute('name', this.name);
      /** traverse the dom-tree from here, and look for the directives I ned */
      for (const [elm, dir] of findNewDirectives(el, [InputNameDirective, OfSubSetDirective], this) as IterableIterator<
        [HTMLFormElement, any]
      >) {
        /** if the found directives name is also in the data, put it in. */
        if (data.hasOwnProperty(elm.name)) {
          fillFormElement(elm, data[elm.name]);
        }
        inputs.push(dir);
      }
    });
    /** defer the hookup to the next cycle, that way everything we need to know will be in place. */
    setTimeout(
      /**
       * get all the input xx.value$ observables
       * make 1 big observable out of it.
       * push it to the value$ of this directive, so it gets picked up by the parent.
       */
      () => (this.hookupSubscription = transformFormObervers(gatherFormObservables(inputs)).subscribe(this._value)),
      0
    );
  }

  /** my mom did teach me to clean up after myself */
  ngOnDestroy(): void {
    this.view && this.view.destroy();
    this.hookupSubscription.unsubscribe();
    this.fieldDataSubscription.unsubscribe();
  }
}
