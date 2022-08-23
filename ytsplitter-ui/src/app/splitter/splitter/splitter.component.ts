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
    tracks_source: new FormControl("manual", [Validators.required]),
    tracks: new FormArray([]),
  });

  info: any;

  proposed_tracks: any[];
  proposed_name: any;

  statusTrack: any;

  constructor(
    private splitterService: SplitterService,
  ) { }

  ngOnInit(): void {}


  afterFirstStep() {
    this.splitterService.getVideoInfo(this.formFirstStep.value.v).subscribe((data) => {
      this.info = data.info;
      this.proposed_tracks = data.tracks;
      this.proposed_name = data.name;

      console.log('PROPSOED TRACKS', this.proposed_tracks)

      if(this.info.title) {
        this.formSecondStep.setValue({
          album: this.proposed_name.album ?? '',
          artist: this.proposed_name.artist ?? '',
          tracks_source: 'manual',
          tracks: [],
        });
      }

      if (this.proposed_tracks) {
        const array = this.formSecondStep.controls.tracks as FormArray;
        for (let track of this.proposed_tracks) {
          array.push(new FormGroup({
            ss: new FormControl(track.ss),
            t: new FormControl(track.t),
            title: new FormControl(track.title)
          }));
        }
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
      tracks_source: second.tracks_source,
      tracks: second.tracks
    }
    this.splitterService.download(data).subscribe((status) => {
      this.statusTrack = status;
    })
  }

}
