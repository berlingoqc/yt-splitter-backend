import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtistListComponent } from './artist-list/artist-list.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { AlbumDetailComponent } from './album-detail/album-detail.component';
import { AlbumDetailResolver, AlbumResolver, ArtistsResolver } from './music-explorer.service';



@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ArtistListComponent,
        resolve: {
          artists: ArtistsResolver
        }
      },
      {
        path: ':artist/albums',
        component: AlbumListComponent,
        resolve: {
          albums: AlbumResolver,
        }
      },
      {
        path: ':artist/albums/:album',
        component: AlbumDetailComponent,
        resolve: {
          detail: AlbumDetailResolver,
        }
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class MusicExplorerRoutingModule { }
