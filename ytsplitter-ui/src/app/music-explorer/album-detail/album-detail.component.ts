import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { MusicPlayerService } from 'src/app/music-player/music-player.service';
import { MusicExplorerService } from '../music-explorer.service';

const openDirectory = async () => {
  try {
    // Always returns an array.
    const handle = await (window as any).showDirectoryPicker();
    console.log(handle);
    return handle;
  } catch (err) {
    console.error(err.name, err.message);
  }
};

const saveByteArray = (data, name) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  const url = window.URL.createObjectURL(data);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.scss'],
})
export class AlbumDetailComponent implements OnInit {
  artist: string;
  album: string;

  detail: any;

  thumbnail: Blob;

  constructor(
    private activatedRoute: ActivatedRoute,
    private musicPlayer: MusicPlayerService,
    private explorer: MusicExplorerService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.artist = this.activatedRoute.snapshot.params.artist;
    this.album = this.activatedRoute.snapshot.params.album;
    this.activatedRoute.data
      .pipe(map((x) => x.detail))
      .subscribe((d) => (this.detail = d));

    this.explorer
      .downloadThumbnail(this.artist, this.album)
      .subscribe((data) => {
        this.thumbnail = data;
      });


  }

  async playTrack(track: string): Promise<void> {
    console.log(this.musicPlayer.audio);
    this.musicPlayer.playTrack(this.artist, this.album, track);
  }

  async downloadTrack(track: string) {
    this.explorer
      .downloadTrack(this.artist, this.album, track)
      .subscribe((data) => {
        saveByteArray(data, track);
      });
  }

  async downloadArchive() {
    openDirectory().then(async (dirref) => {
      for(const track of this.detail.tracks) {
        try {
        const blob = await this.explorer.downloadTrack(this.artist,this.album, track).toPromise();
        const new_file = await dirref.getFileHandle(track, {create: true});
        const writer = await new_file.createWritable();
        await writer.write(blob);
        await writer.close();
        } catch(e) {
          this.snackBar.open(`Erreur ${track}`, '', { duration: 2000 })
          return;
        }
     }

     this.snackBar.open(`Fin du download de ${this.artist} ${this.album}`, '', { duration: 2000 })
    });
    //this.explorer.downloadArchive(this.artist, this.album).subscribe((data) => {
    //  saveByteArray(data, `${this.artist} ${this.album}.zip`);
    //});
  }
}
