import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharteHostingComponent } from './charte-hosting.component';

describe('CharteHostingComponent', () => {
  let component: CharteHostingComponent;
  let fixture: ComponentFixture<CharteHostingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharteHostingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CharteHostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
