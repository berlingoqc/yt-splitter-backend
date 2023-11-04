import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailEditComponent } from './thumbnail-edit.component';

describe('ThumbnailEditComponent', () => {
  let component: ThumbnailEditComponent;
  let fixture: ComponentFixture<ThumbnailEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThumbnailEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
