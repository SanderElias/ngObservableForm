import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { InputNameDirective } from './observableForm/input-name.directive';
import { ObservableFromDirective } from './observableForm/observable-from.directive';

@NgModule({
  declarations: [
    AppComponent,
    FormDemoComponent,
    InputNameDirective,
    ObservableFromDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
