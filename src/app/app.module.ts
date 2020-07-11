import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { FormDemoComponent } from "./form-demo/form-demo.component";
import { LifeHookDemoComponent } from "./life-hook-demo/life-hook-demo.component";
import { ReactiveLifeCycleHooksComponent } from "./life-hook-demo/ReactiveLifeCycleHooksComponent";
import { ReactiveLifeCycleHooksContainerComponent } from "./life-hook-demo/ReactiveLifeCycleHooksContainerComponent";
import { TimeComponent } from "./life-hook-demo/time/time.component";
import { ObservableFormComponent } from "./observable-form/observable-form.component";
import { SeObservableFormModule } from "./se-observable-form/se-observable-form.module";
import { SimpleFormComponent } from "./simple-form/simple-form.component";

const routes: Routes = [
  { path: "formDemo", component: FormDemoComponent },
  { path: "observable", component: ObservableFormComponent },
  { path: "lifeHook", component: LifeHookDemoComponent },
  { path: "mic", component: ReactiveLifeCycleHooksContainerComponent },
  { path: "simple", component: SimpleFormComponent },
  { path: "simple/:id", component: SimpleFormComponent },
  // { path: '**', redirectTo: 'observable' }
];

@NgModule({
  declarations: [
    AppComponent,
    FormDemoComponent,
    LifeHookDemoComponent,
    SimpleFormComponent,
    ObservableFormComponent,
    TimeComponent,
    ReactiveLifeCycleHooksComponent,
    ReactiveLifeCycleHooksContainerComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserModule,
    HttpClientModule,
    SeObservableFormModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
