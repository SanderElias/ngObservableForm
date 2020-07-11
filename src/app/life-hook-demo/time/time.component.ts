import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MakeObservable } from '../life-hook-demo.component';

@Component({
  selector: 'app-time',
  template: `
    <p>time works! {{ time | async }}</p>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeComponent {
  @MakeObservable() @Input() time: Observable<string>;
}
