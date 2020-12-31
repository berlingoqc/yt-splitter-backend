import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUrlComponent } from './select-url.component';

describe('SelectUrlComponent', () => {
  let component: SelectUrlComponent;
  let fixture: ComponentFixture<SelectUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
