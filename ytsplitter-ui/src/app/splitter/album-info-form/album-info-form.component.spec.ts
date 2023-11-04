import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumInfoFormComponent } from './album-info-form.component';

describe('AlbumInfoFormComponent', () => {
  let component: AlbumInfoFormComponent;
  let fixture: ComponentFixture<AlbumInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlbumInfoFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
