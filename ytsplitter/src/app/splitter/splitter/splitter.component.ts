import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { SplitterService } from '../splitter.service';

@Component({
  selector: 'app-splitter',
  templateUrl: './splitter.component.html',
  styleUrls: ['./splitter.component.scss']
})
export class SplitterComponent implements OnInit {

  formFirstStep = new FormGroup({
    v: new FormControl(null, [Validators.required])
  });


  formSecondStep = new FormGroup({
    album: new FormControl(null, [Validators.required]),
    artist: new FormControl(null, [Validators.required]),
    tracks: new FormArray([]),
  });

  info: any;

  statusTrack: any;

  constructor(
    private splitterService: SplitterService,
  ) { }

  ngOnInit(): void {}


  afterFirstStep() {
    this.splitterService.getVideoInfo(this.formFirstStep.value.v).subscribe((data) => {
      this.info = data;
      if(this.info.media) {
        this.formSecondStep.setValue({
          album: this.info.media.album ?? '',
          artist: this.info.media.artist ?? '',
          tracks: []
        });
      }
    });
  }

  startDownload() {
    const first = this.formFirstStep.value;
    const second = this.formSecondStep.value;
    const data = {
      v: first.v,
      album: {
        album: second.album,
        artist: second.artist,
      },
      tracks: second.tracks
    }
    this.splitterService.download(data).subscribe((status) => {
      this.statusTrack = status;
    })
  }

}
