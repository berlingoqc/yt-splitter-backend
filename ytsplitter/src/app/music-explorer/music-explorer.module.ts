import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistListComponent } from './artist-list/artist-list.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { AlbumDetailComponent } from './album-detail/album-detail.component';
import { AlbumDetailResolver, AlbumResolver, ArtistsResolver, MusicExplorerService } from './music-explorer.service';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MusicExplorerRoutingModule } from './music-explorer.routing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ImageModule } from '../thumbnail/thumbnail.component';



@NgModule({
  declarations: [ArtistListComponent, AlbumListComponent, AlbumDetailComponent],
  imports: [
    CommonModule,

    ImageModule,

    MatButtonModule,
    MatListModule,
    MatIconModule,

    MatSnackBarModule,

    MusicExplorerRoutingModule
  ],
  providers: [
    MusicExplorerService,
    ArtistsResolver,
    AlbumDetailResolver,
    AlbumResolver,
  ]
})
export class MusicExplorerModule { }
