import { Component, OnInit, OnDestroy } from '@angular/core';
import { LifeCycleHook } from '../form-demo/lifeHook';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

type Constructor<T = {}> = new (...args: any[]) => T;

export const onDestroy = <T extends Constructor>(base: T = class {} as T) =>
  class extends base implements OnDestroy {
    private _destroy = new Subject<void>();

    /** observable that emits once on destroy */
    destroy$ = this._destroy.asObservable();

    ngOnDestroy() {
      // tslint:disable-next-line:no-unused-expression
      super['ngOnDestroy'] && super['ngOnDestroy']();
      this._destroy.next();
    }
  };

export const onInit = <T extends Constructor>(base: T = class {} as T)  =>
  class OnInitSubject extends base implements OnInit {
    private _init = new Subject<void>();
    onInit$ = this._init.asObservable();

    ngOnInit(): void {
      // tslint:disable-next-line:no-unused-expression
      super['ngOniit'] && super['ngOnInit']();
      this._init.next();
    }
  };

@Component({
  selector: 'app-life-hook-demo',
  template: `
    <ul>
      <li *ngFor="let item of showHooks$ | async">{{ item }}</li>
    </ul>
  `,
  styleUrls: ['./life-hook-demo.component.css']
})
export class LifeHookDemoComponent extends onDestroy(onInit()) {
  @LifeCycleHook('onInit') init$: Observable<void>;
  @LifeCycleHook('afterViewInit') av$: Observable<void>;

  showHooks$ = combineLatest([this.init$ , this.av$]).pipe(
    map(([init]) => ['Init hook fired', 'After view hook fired']),
    takeUntil(this.destroy$)
  );

  constructor() {
    super();
    this.destroy$.subscribe(() => console.log('destroy called'));
    this.onInit$.subscribe(() => console.log('onInit called'));

  }
}
