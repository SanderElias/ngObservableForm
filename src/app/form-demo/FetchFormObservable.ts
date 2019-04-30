import {
  ɵComponentDef as ComponentDef,
  ɵgetDirectives as getDirectives,
  ɵgetLContext as getLContext,
  ɵmarkDirty as markDirty
} from '@angular/core';
import { concat, Observable, of } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';
import { getHookObservable } from './lifeHook';
import { ObservableFormDirective } from '../se-observable-form/form/observable-form.directive';

export declare var ng: any;

export function FetchFormObservable(name?: string): Function {
  return function(target: ComponentDef<any>, propertyKey: string, descriptor: PropertyDescriptor): Observable<void> {
    const content$ = getHookObservable(target, 'afterContentInit');
    const view$ = getHookObservable(target, 'afterViewInit');
    const cdef: ComponentDef<any> = target.constructor['ngComponentDef'];
    const selector = `form[observable${typeof name === 'string' ? '=' + name.trim() : ''}]`;
    // window['cdef'] = cdef;
    target[propertyKey] = concat(content$, view$).pipe(
      /** make 200% sure we don't re-init/ */
      first(),
      /** switch to the actual formData stuff */
      switchMap(() => {
        // console.log('componentDefinition', cdef);
        /** init done, DOM is ready */
        /**
         *  for now, cheat, as ivy isn't yet exposing all I need
         *  use plain DOM tricks to find the elements node, and then
         * use the not yet properly exposed getDirectives to get my formDirective
         */
        const form = document.querySelector(selector);
        const observableForm = getDirectives(form).find(
          i => i instanceof ObservableFormDirective
        ) as ObservableFormDirective;
        if (observableForm) {
          // return observableForm.formData$; //.pipe(tap(data => ɵmarkDirty(target)));
          return observableForm.formData$ //.pipe(tap(data => markDirty(getLContext(form))));
        }
        return of(undefined);
      })
    );
    return target[propertyKey];
  };
}
