// import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { InputNameDirective } from './observableForm/input-name.directive';
import { ObservableFormDirective } from './observableForm/observable-form.directive';
import { FillFormDirective } from './observableForm/fill-form.directive';
import { LifeHookDemoComponent } from './life-hook-demo/life-hook-demo.component';
import { SimpleFormComponent } from './simple-form/simple-form.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    FormDemoComponent,
    InputNameDirective,
    ObservableFormDirective,
    FillFormDirective,
    LifeHookDemoComponent,
    SimpleFormComponent
  ],
  imports: [
    // BrowserModule
    // CommonModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
