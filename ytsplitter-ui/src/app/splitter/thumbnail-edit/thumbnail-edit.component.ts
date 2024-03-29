import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ContextService } from 'src/app/service/context.service';


declare const Cropper: any;

@Component({
  selector: 'app-thumbnail-edit',
  templateUrl: './thumbnail-edit.component.html',
  styleUrls: ['./thumbnail-edit.component.scss']
})
export class ThumbnailEditComponent implements OnInit, AfterViewInit {

  @ViewChild('img') img: ElementRef<HTMLImageElement>;

  private _thumbnails: ThumbnailEditComponent['tumbnails'];
  @Input() set tumbnails(v: {url: string, height: number, width: number}[]) {
    this._thumbnails = v?.filter(x => x.height && x.width) || [];
    this.selectedIndex = this._thumbnails.findIndex(x => x.height === 180);
    this.selectedIndex = (this.selectedIndex === -1) ? 0 : this.selectedIndex;
    console.log('SELECTED INDEX', this.selectedIndex);
  }
  get tumbnails() {
    return this._thumbnails;
  }

  @Input() artist: string;
  @Input() album: string;


  selectedIndex = 0;

  cropper;

  constructor(
    private http: HttpClient,
    public context: ContextService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.cropper = new Cropper(this.img.nativeElement, {
      aspectRatio: 1,
    });
    console.log(this.cropper);
  }

  changeSelection(index) {
    this.selectedIndex = index;
    //this.img.nativeElement.src =
    this.cropper.replace(this.context.url + '/proxy-download?url=' + this.tumbnails[index].url);
  }

  send() {
    this.cropper.getCroppedCanvas().toBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'thumbnail.jpg');
      this.http.post(`${this.context.url}/explorer/${this.artist}/albums/${this.album}/thumbnail`, formData).subscribe(() => {
        console.log('D');
      })
    })
  }
}
