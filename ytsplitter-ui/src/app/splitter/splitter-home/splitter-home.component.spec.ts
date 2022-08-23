import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitterHomeComponent } from './splitter-home.component';

describe('SplitterHomeComponent', () => {
  let component: SplitterHomeComponent;
  let fixture: ComponentFixture<SplitterHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitterHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
