import { Observable, Subject, concat, of } from 'rxjs';
import { Component } from '@angular/compiler/src/core';
import { ComponentDef } from '@angular/core/src/render3';
import { first, switchMap } from 'rxjs/operators';
export const MONKEY_PATCH_KEY_NAME = '__ngContext__';

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
  console.log('this', this);
  return function(
    target: ComponentDef<any>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): Observable<void> {
    const observable = getHookObservable(target, ref);
    // don't expose the subject, but create a observers that fires once and then completes.
    target[propertyKey] = observable;
    return target[propertyKey];
  };
}

/**
 *
 * @param target object to examine
 * @param ref name of the hook
 */
function getHookObservable(
  target: ComponentDef<any>,
  ref: keyof AvailableHooks
): Observable<void> {
  const hookList = (target[AvailableHooks] = target[AvailableHooks] || {});
  if (hookList[ref]) {
    // if the subject is already there, just return it.
    return hookList[ref].asObservable().pipe(first());
  }
  // create a new subject and modify the component to handle it.
  const cdef = target.constructor['ngComponentDef'];
  const orgHook = cdef[ref];
  // store the hook for future use;
  hookList[ref] = new Subject<void>();
  // patch the life-cycle hook, so it fires off the subject.
  cdef[ref] = function onInit() {
    console.log('fire hook' + ref);
    // schedule a microtask to push this to the end of execution
    Promise.resolve().then(() => hookList[ref].next());
    // tslint:disable-next-line:no-unused-expression
    orgHook && orgHook.call(target);
  }.bind(target);
  // return the newly created subject
  return hookList[ref].asObservable().pipe(first());
}

function FetchFormObservable(name) {
  return function(
    target: ComponentDef<any>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): Observable<void> {
    const content$ = getHookObservable(target, 'afterContentInit');
    const view$ = getHookObservable(target, 'afterViewInit');
    target[propertyKey] = concat(content$, view$).pipe(
      /** switch to the actual 'deal */
      switchMap(() => of('init done'))
    );
    return target[propertyKey];
  };
}
