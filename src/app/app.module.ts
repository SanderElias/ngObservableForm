// import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { InputNameDirective } from './observableForm/input-name.directive';
import { ObservableFormDirective } from './observableForm/observable-form.directive';
import { FillFormDirective } from './observableForm/fill-form.directive';

@NgModule({
  declarations: [
    AppComponent,
    FormDemoComponent,
    InputNameDirective,
    ObservableFormDirective,
    FillFormDirective
  ],
  imports: [
    // BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
