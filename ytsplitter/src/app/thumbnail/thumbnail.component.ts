import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, NgModule, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit, AfterViewInit {

  @ViewChild('img') img: ElementRef<HTMLImageElement>;


  private _data: Blob;

  @Input()
  set data(blob: Blob) {
    this._data = blob;
    if(!this._data)
      return;
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);
    this.img.nativeElement.src = imageUrl;
  }

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.data = this._data;
  }

}


@NgModule({
  imports: [CommonModule],
  declarations: [ThumbnailComponent],
  exports: [ThumbnailComponent]
})
export class ImageModule {

}
