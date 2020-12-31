import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoInfoCardComponent } from './video-info-card.component';

describe('VideoInfoCardComponent', () => {
  let component: VideoInfoCardComponent;
  let fixture: ComponentFixture<VideoInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoInfoCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
