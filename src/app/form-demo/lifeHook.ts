import { Observable, Subject } from 'rxjs';
import { Component } from '@angular/compiler/src/core';
import { ComponentDef } from '@angular/core/src/render3';
export const MONKEY_PATCH_KEY_NAME = '__ngContext__';

interface AvailableHooks {
  onInit: Observable<void>;
  onDestroy: Observable<void>;
  afterContentInit: Observable<void>;
  afterViewInit: Observable<void>;
}

export function LifeCycleHook(
  ref: keyof AvailableHooks
): Function {
  console.log('this', this)
  return function(
    target: ComponentDef<any>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): Observable<void> {
    const cdef = target.constructor['ngComponentDef'];
    const orgHook = cdef[ref];
    const s = new Subject<void>();
    target[propertyKey] = new Subject<void>();
    cdef[ref] = function onInit() {
      console.log('fire hook' + ref);
      // schedule a microtask to push this to the end of execution
      Promise.resolve().then(() => target[propertyKey].next());
      // tslint:disable-next-line:no-unused-expression
      orgHook && orgHook.call(target);
    }.bind(target);
    return s;
  };
}
