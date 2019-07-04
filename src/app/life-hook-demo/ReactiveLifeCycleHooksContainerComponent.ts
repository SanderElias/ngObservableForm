import {Component, OnInit, SimpleChanges} from '@angular/core';
import {LifeCycleHook} from '@se-ng/ivy-life-cycle-decorators';
import {concat, interval, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
@Component({
  selector: 'app-reactive-life-cycle-hooks-container',
  template: `
    <h1>
      reactive-lifecycle-hooks-container works!
    </h1>
    <app-reactive-lifecycle-hooks [state]="initialState"> </app-reactive-lifecycle-hooks>
  `,
  styles: []
})
export class ReactiveLifeCycleHooksContainerComponent implements OnInit {
  initialState = {
    value: 0,
    options: [1, 2, 3, 4, 5]
  };
  @LifeCycleHook('doCheck') doCheck$: Observable<void>;
  @LifeCycleHook('onChanges') onChanges$: Observable<SimpleChanges>;
  @LifeCycleHook('onInit') onInit$: Observable<void>;
  // @LifeCycleHook('afterContentChecked') afterContentChecked$: Observable<void>;
  @LifeCycleHook('afterContentInit') afterContentInit$: Observable<void>;
  // @LifeCycleHook('afterViewChecked') afterViewChecked$: Observable<void>;
  @LifeCycleHook('afterViewInit') afterViewInit$: Observable<void>;
  @LifeCycleHook('onDestroy') onDestroy$: Observable<void>;

  state$ = concat(
    this.afterViewInit$,
    interval(1000).pipe(
      map(v => ({
        ...this.initialState,
        value: v
      }))
    )
  );
  /**/
  constructor() {
    this.doCheck$.pipe(take(10)).subscribe(v => console.log('doCheck$', v));
    this.onChanges$.pipe(take(10)).subscribe(v => console.log('onChanges$', v));
    this.onInit$.subscribe(v => console.log('onInit$', v));
    // this.afterContentChecked$.pipe(take(100)).subscribe(v => console.log('afterContentChecked$', v));
    this.afterContentInit$.subscribe(v => console.log('afterContentInit$', v));
    // this.afterViewChecked$.pipe(take(100)).subscribe(v => console.log('afterViewChecked$', v));
    this.afterViewInit$.subscribe(v => console.log('afterViewInit$', v));
    this.onDestroy$.subscribe(v => console.log('onDestroy$', v));
    /**/
  }
  ngOnInit() {}
}
