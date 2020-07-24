# Ivy Life Cycle Decorators

Beta notice: This lib is considered beta, until Ivy is the primary renderer in Angular
A typescript decorator to be able to use Angular life-cycle hooks in an observable way. Works with Ivy only.

Those life-cycle observables will make the reactive way of programming a lot easier. There is no more need to manually create an subject. For a quick before/after comparison, I added the sample in a 'before' state at the end of the document.



to use the library do:

```bash
yarn add @se-ng/ivy-life-cycle-decorators
```


## Sample:

### Result

![sample](https://github.com/SanderElias/ngObservableForm/raw/main/projects/se-ng/ivy-life-cycle-decorators/img/sample.png)

### Code
```typescript
import {Component} from '@angular/core';
import {LifeCycleHook} from '@se-ng/ivy-life-cycle-decorators';
import {combineLatest, Observable} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';

@Component({
  selector: 'app-life-hook-demo',
  template: `
    <ul>
      <li *ngFor="let item of showHooks$ | async">{{ item }}</li>
    </ul>
  `,
  styleUrls: ['./life-hook-demo.component.css']
})
export class LifeHookDemoComponent {
  @LifeCycleHook('onInit') init$: Observable<void>;
  @LifeCycleHook('afterViewInit') av$: Observable<void>;
  @LifeCycleHook('onDestroy') destroy$: Observable<void>;

  showHooks$ = combineLatest([this.init$, this.av$]).pipe(
    map(() => ['Init hook fired', 'After view hook fired']),
    takeUntil(this.destroy$),
    tap({
      next: r => console.log(r),
      complete: () => console.log('Completed')
    })
  );
}
```

This libray has support for the following hooks:
```typescript
interface AvailableHooks {
  afterContentChecked: Observable<void>;
  afterContentInit: Observable<void>;
  AfterViewChecked: Observable<void>;
  afterViewInit: Observable<void>;
  doCheck: Observable<void>;
  onChanges: Observable<SimpleChanges>;
  onDestroy: Observable<void>;
  onInit: Observable<void>;
}
```

The hooks that fire once, will complete directly after invocation. The other hooks will complete when the components gets destroyed. 

### The same sample without `@LifeCycleHook` decorator

```typescript
export class Before implements OnInit, AfterViewInit, OnDestroy {
  private init$ = new Subject<void>();
  private av$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  showHooks$ = combineLatest([this.init$, this.av$]).pipe(
    map(() => ['Init hook fired', 'After view hook fired']),
    takeUntil(this.destroy$),
    tap({
      next: r => console.log(r),
      complete: () => console.log('Completed')
    })
  );

  ngOnInit() {
    this.init$.next();
  }
  ngAfterViewInit() {
    this.av$.next();
  }
  ngOnDestroy() {
    this.destroy$.next();
  }
}
```

Also note, that the  `@LifeCycleHook` decorator will expose observables, not subjects. 
