import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './player/player.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [PlayerComponent],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [PlayerComponent],
})
export class MusicPlayerModule { }
