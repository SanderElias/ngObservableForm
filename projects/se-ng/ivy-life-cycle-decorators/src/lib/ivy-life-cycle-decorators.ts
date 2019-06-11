import {ɵComponentDef as ComponentDef, ɵNG_COMPONENT_DEF as NG_COMPONENT_DEF} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {first} from 'rxjs/operators';
export const MONKEY_PATCH_KEY_NAME = '__ngContext__';

declare var ng: any;

const AvailableHooks = Symbol('seHooks');
interface AvailableHooks {
  onInit: Observable<void>;
  onDestroy: Observable<void>;
  afterContentInit: Observable<void>;
  afterViewInit: Observable<void>;
}
/**
 * Will create an observable that fires and completes when the given hook is fired.
 * @param ref Name of the hook
 */
export function LifeCycleHook(ref: keyof AvailableHooks): Function {
  // console.log('this', this);
  return function(target: ComponentDef<any>, propertyKey: string, descriptor: PropertyDescriptor): Observable<void> {
    const observable = getHookObservable(target, ref);
    // don't expose the subject, but create a observers that fires once and then completes.
    target[propertyKey] = observable;
    return target[propertyKey];
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
  const hookList = (component[AvailableHooks] = component[AvailableHooks] || {});
  if (hookList[hookName]) {
    // if the subject is already there, just return it.
    return hookList[hookName].pipe(first());
  }
  // get the component definition
  const cdef: ComponentDef<any> = component.constructor[NG_COMPONENT_DEF];
  // keep the "orignal" onXXX hook
  const orgHook = cdef[hookName];
  // store the hook for future use;
  hookList[hookName] = new Subject<void>();
  // patch the life-cycle hook, so it fires off the subject.
  cdef[hookName] = function onInit() {
    // schedule a micro-task to push this to the end of execution
    Promise.resolve().then(() => hookList[hookName].next());
    // tslint:disable-next-line:no-unused-expression
    orgHook && orgHook.call(component);
  }.bind(component);
  // return the newly created subject, this will assign it to the decorated property in the component
  return hookList[hookName].pipe(first());
}
