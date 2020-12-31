import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { ContextService } from "../service/context.service";


export interface Track {
  artist: string;
  album: string;
  track: string;
}


@Injectable({providedIn: 'root'})
export class MusicPlayerService {
  audio: HTMLAudioElement;

  playing: Track;

  playerSubject = new Subject();

  private playlists: Track[] = [];

  constructor(private httpClient: HttpClient, private context: ContextService) {}

  getTrackURL(artist: string, album: string, track: string) {
    return `${this.context.url}/explorer/${artist}/albums/${album}/${track}`;
  }

  async playTrack(artist: string, album: string, track: string) {
    if(this.audio) {
      this.audio.src = this.getTrackURL(artist, album, track);
      await this.audio.play();
      this.playing = {artist, album, track};
    }
  }

  async flushPlayer() {
    this.playlists = [];
    await this.audio.pause();
    this.audio.src = '';
    this.playing = null;
    this.playerSubject.next('flush');
  }
}
