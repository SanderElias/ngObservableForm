import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NgModelFormComponent } from './ng-model-form/ng-model-form.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppComponent, NgModelFormComponent],
  imports: [BrowserModule, CommonModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
