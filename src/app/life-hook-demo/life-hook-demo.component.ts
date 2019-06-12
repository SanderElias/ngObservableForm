import {Component} from '@angular/core';
import {LifeCycleHook, getHookObservable} from '@se-ng/ivy-life-cycle-decorators';
import {combineLatest, Observable, Subject, interval} from 'rxjs';
import {map, takeUntil, tap, take} from 'rxjs/operators';
import {ɵComponentDef as ComponentDef, ɵNG_COMPONENT_DEF as NG_COMPONENT_DEF, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-life-hook-demo',
  template: `
    <ul>
      <li *ngFor="let item of showHooks$ | async">{{ item }}</li>
    </ul>
    <app-time [time]="time$ | async"></app-time>
  `,
  styleUrls: ['./life-hook-demo.component.css']
})
export class LifeHookDemoComponent {
  @LifeCycleHook('onInit') init$: Observable<void>;
  @LifeCycleHook('afterViewInit') av$: Observable<void>;
  @LifeCycleHook('onDestroy') destroy$: Observable<void>;

  time$ = interval(500).pipe(
    /** quick&dirty extract time */
    map(
      () =>
        new Date()
          .toISOString()
          .split('T')[1]
          .split('.')[0]
    ),
    takeUntil(this.destroy$)
  );

  showHooks$ = combineLatest([this.init$, this.av$]).pipe(
    map(() => ['Init hook fired', 'After view hook fired']),
    takeUntil(this.destroy$),
    tap({
      next: r => console.log(r),
      complete: () => console.log('Completed')
    })
  );
}

export function MakeObservable(): Function {
  return function(component: ComponentDef<any>, inputName: string, descriptor: PropertyDescriptor): Observable<any> {
    const innerSB = new Subject();
    const retour = innerSB.asObservable().pipe(tap(r => Promise.resolve().then(() => undefined)));
    getHookObservable(component, 'onDestroy').subscribe(() => innerSB.complete());
    Object.defineProperty(component, inputName, {
      set: newValue => innerSB.next(newValue),
      get: () => retour,
      enumerable: true,
      configurable: true
    });
    return innerSB.asObservable() as Observable<any>;
  };
}
