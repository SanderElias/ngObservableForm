import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { LifeHookDemoComponent } from './life-hook-demo/life-hook-demo.component';
import { FillFormDirective } from './observableForm/fill-form.directive';
import { InputNameDirective } from './observableForm/input-name.directive';
import { ObservableFormDirective } from './observableForm/observable-form.directive';
import { SimpleFormComponent } from './simple-form/simple-form.component';
import { BrowserModule } from '@angular/platform-browser';
import { FillFormArrDirective } from './observableForm/fill-form-arr.directive';

const routes: Routes = [
  { path: '', component: FormDemoComponent },
  { path: 'simple', component: SimpleFormComponent },
  { path: 'simple/:id', component: SimpleFormComponent },
  // { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    FormDemoComponent,
    InputNameDirective,
    ObservableFormDirective,
    FillFormDirective,
    LifeHookDemoComponent,
    SimpleFormComponent,
    FillFormArrDirective,
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    CommonModule,
    HttpClientModule,
  ],
  providers: [],
  // bootstrap: [AppComponent],
})
export class AppModule {}

