import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputNameDirective } from './input/input-name.directive';
import { ObservableFormDirective } from './form/observable-form.directive';
import { FillFormDirective } from './fill/fill-form.directive';
import { FillFormArrDirective } from './fill/fill-form-arr.directive';
import { OfSubSetDirective } from './form/of-sub-set.directive';

const declarations = [
  InputNameDirective,
  ObservableFormDirective,
  FillFormDirective,
  FillFormArrDirective,
  OfSubSetDirective
];

@NgModule({
  declarations: declarations,
  imports: [CommonModule],
  exports: declarations
})
export class SeObservableFormModule {}
