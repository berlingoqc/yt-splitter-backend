import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoInfoCardComponent } from './video-info-card/video-info-card.component';
import { SelectUrlComponent } from './select-url/select-url.component';
import { SettingsFormComponent } from './settings-form/settings-form.component';
import { ProcessStatusComponent } from './process-status/process-status.component';
import { SplitterComponent } from './splitter/splitter.component';
import { SplitterRoutingModule } from './splitter.routing';
import { SplitterService } from './splitter.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AlbumInfoFormComponent, TrackSSInputComponent } from './album-info-form/album-info-form.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { SplitterHomeComponent } from './splitter-home/splitter-home.component';
import { ThumbnailEditComponent } from './thumbnail-edit/thumbnail-edit.component';

@NgModule({
  declarations: [VideoInfoCardComponent, SelectUrlComponent, SettingsFormComponent, ProcessStatusComponent, SplitterComponent, AlbumInfoFormComponent, TrackSSInputComponent, SplitterHomeComponent, ThumbnailEditComponent],
  imports: [
    CommonModule,

    ReactiveFormsModule,
    MatFormFieldModule,
    MatStepperModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressBarModule,


    ScrollingModule,

    SplitterRoutingModule,
  ],
  providers: [SplitterService]
})
export class SplitterModule { }
