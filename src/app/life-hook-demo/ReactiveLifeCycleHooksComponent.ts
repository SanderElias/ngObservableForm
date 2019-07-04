import {Component, OnInit, Input} from '@angular/core';
@Component({
  selector: 'app-reactive-lifecycle-hooks',
  template: `
    <p>
      reactive-lifecycle-hooks works!
    </p>
  `,
  styles: []
})
export class ReactiveLifeCycleHooksComponent implements OnInit {
  @Input() state;
  constructor() {}
  ngOnInit() {}
}
