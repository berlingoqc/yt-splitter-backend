import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { SplitterService } from '../splitter.service';

@Component({
  selector: 'app-splitter',
  templateUrl: './splitter.component.html',
  styleUrls: ['./splitter.component.scss']
})
export class SplitterComponent implements OnInit {

  @ViewChild(MatStepper) stepper: MatStepper;

  formFirstStep = new FormGroup({
    v: new FormControl(null, [Validators.required])
  });


  formSecondStep = new FormGroup({
    album: new FormControl(null, [Validators.required]),
    artist: new FormControl(null, [Validators.required]),
    year: new FormControl(null, []),
    tracks_source: new FormControl("manual", [Validators.required]),
    tracks: new FormArray([]),
  });

  info: any;

  proposed_tracks: any[];
  proposed_name: any;

  statusTrack: any;

  subRequest: Subscription;
  errorRequest: string;

  constructor(
    private splitterService: SplitterService,
  ) { }

  ngOnInit(): void {}


  afterFirstStep() {
    this.subRequest = this.splitterService.getVideoInfo(this.formFirstStep.value.v).subscribe(
    (data) => {
      this.subRequest = null;
      this.stepper.next();
      this.info = data.info;
      this.proposed_tracks = data.tracks;
      this.proposed_name = data.name;

      console.log('PROPSOED TRACKS', this.proposed_tracks)

      if(this.info.title) {
        this.formSecondStep.setValue({
          album: this.proposed_name.album ?? '',
          artist: this.proposed_name.artist ?? '',
          year: this.proposed_name.year ?? '',
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
    },
    ({ error }) => {
      this.subRequest = null;
      this.errorRequest = error.stderr;
      console.log('ERROR ', error)
    }
    );
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
