import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-info-card',
  templateUrl: './video-info-card.component.html',
  styleUrls: ['./video-info-card.component.scss']
})
export class VideoInfoCardComponent implements OnInit {

  @Input() video: any;

  constructor() { }

  ngOnInit(): void {
  }

}
