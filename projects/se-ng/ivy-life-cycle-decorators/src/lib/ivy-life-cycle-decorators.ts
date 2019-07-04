import {SimpleChanges, ɵComponentDef as ComponentDef, ɵNG_COMPONENT_DEF as NG_COMPONENT_DEF} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {take} from 'rxjs/operators';
export const MONKEY_PATCH_KEY_NAME = '__ngContext__';

const AvailableHooks = Symbol('seHooks');
interface AvailableHooks {
  afterContentChecked: Observable<void>;
  afterContentInit: Observable<void>;
  afterViewChecked: Observable<void>;
  afterViewInit: Observable<void>;
  doCheck: Observable<void>;
  onChanges: Observable<SimpleChanges>;
  onDestroy: Observable<void>;
  onInit: Observable<void>;
}

const hookIsAutoCompleting: {[x in keyof AvailableHooks]: boolean} = {
  afterContentChecked: false,
  afterContentInit: true,
  afterViewChecked: false,
  afterViewInit: true,
  doCheck: false,
  onChanges: false,
  onDestroy: true,
  onInit: true
};

/**
 * Will create an observable that fires and completes when the given hook is fired.
 * @param hookName Name of the hook
 */
export function LifeCycleHook(hookName: keyof AvailableHooks): Function {
  // console.log('this', this);
  return function(
    component: ComponentDef<any>,
    PropertyToAssignObservableTo: string,
    descriptor: PropertyDescriptor
  ): Observable<void> {
    const observable = getHookObservable(component, hookName);
    // don't expose the subject, but create a observers that fires once and then completes.
    component[PropertyToAssignObservableTo] = observable;
    return component[PropertyToAssignObservableTo];
  };
}

/**
 * A note on ` hookList[ref].pipe(first())`
 * This takes the subject, and returns a observable that completes after it emits.
 * The subject itself will be alive until the component is destroyed.
 * This enables reuse of the same hook multiple times. (Not encouraged!)
 */
/**
 *
 * @param component object to examine
 * @param hookName name of the hook
 */
export function getHookObservable(component: any, hookName: keyof AvailableHooks): Observable<void> {
  /** use a symbol to keep the list attached to the component */
  if (!component[AvailableHooks]) {
    component[AvailableHooks] = {};
    /** make sure all hooks are completed on destroy */
    getHookObservable(component, 'onDestroy').subscribe(() => {
      Object.entries(component[AvailableHooks]).forEach(
        ([name, sub]: [string, Subject<any>]) => !hookIsAutoCompleting[name] && sub.complete()
      );
    });
  }
  const hookList = component[AvailableHooks] as {[P in keyof AvailableHooks]?: Subject<any>};
  const returnHook = () =>
    hookIsAutoCompleting[hookName] ? hookList[hookName].pipe(take(1)) : hookList[hookName].asObservable();
  if (hookList[hookName]) {
    // if the subject is already there, just return it.
    return returnHook();
  }
  // get the component definition
  const cdef: ComponentDef<any> = component.constructor[NG_COMPONENT_DEF];
  // keep the "original" onXXX hook
  const orgHook = cdef[hookName];
  // store the hook for future use;
  hookList[hookName] = new Subject<void>();
  // patch the life-cycle hook, so it fires off the subject.
  cdef[hookName] = function hookHandler(changes?: SimpleChanges) {
    if (hookIsAutoCompleting[hookName]) {
      // schedule a micro-task to push this to the end of execution
      Promise.resolve().then(() => hookList[hookName].next(changes));
    } else {
      // execpt for non-completing hooks.
      hookList[hookName].next(changes);
    }
    // tslint:disable-next-line:no-unused-expression
    orgHook && orgHook.call(component);
  }.bind(component);
  // return the newly created subject, this will assign it to the decorated property in the component
  return returnHook();
}
