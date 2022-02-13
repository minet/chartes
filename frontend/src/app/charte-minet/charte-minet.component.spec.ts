import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharteMinetComponent } from './charte-minet.component';

describe('CharteMinetComponent', () => {
  let component: CharteMinetComponent;
  let fixture: ComponentFixture<CharteMinetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharteMinetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CharteMinetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
