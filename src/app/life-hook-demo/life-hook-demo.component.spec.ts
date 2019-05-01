import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeHookDemoComponent } from './life-hook-demo.component';

describe('LifeHookDemoComponent', () => {
  let component: LifeHookDemoComponent;
  let fixture: ComponentFixture<LifeHookDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LifeHookDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LifeHookDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
