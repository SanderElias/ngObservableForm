import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReactiveFormComponent } from './show-reactive-form.component';

describe('ShowReactiveFormComponent', () => {
  let component: ShowReactiveFormComponent;
  let fixture: ComponentFixture<ShowReactiveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowReactiveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowReactiveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
