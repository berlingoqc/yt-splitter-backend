import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ContextService } from "../service/context.service";



@Injectable({providedIn: 'root'})
export class MusicExplorerService {

  constructor(private httpClient: HttpClient, private context: ContextService) {}

  getArtists() {
    return this.httpClient.get(`${this.context.url}/explorer/artist`)
  }

  getArtistAlbums(artist: string) {
    return this.httpClient.get(`${this.context.url}/explorer/${artist}/albums`)
  }

  getAlbumDetail(artist: string, album: string) {
    return this.httpClient.get(`${this.context.url}/explorer/${artist}/albums/${album}`)
  }

  getThumbnailAlbumURL(artist: string, album: string) {
    return this.context.url + '/explorer/' + artist + '/albums/' + album + '/thumbnail'
  }

  getArchiveDownloadURL(artist: string, album: string) {
    return this.context.url + '/explorer/' + artist + '/albums/' + album + '/archive'
  }

  downloadArchive(artist: string, album: string) {
    return this.httpClient.get(this.getArchiveDownloadURL(artist, album), {responseType: 'blob'});
  }

  downloadThumbnail(artist: string, album: string) {
    return this.httpClient.get(this.getThumbnailAlbumURL(artist, album), {responseType: 'blob'});
  }

  downloadTrack(artist: string, album: string, track: string) {
    const d = `${this.context.url}/explorer/${artist}/albums/${album}/${track}`;
    return this.httpClient.get(d, {responseType: 'blob'});
  }
}

@Injectable()
export class ArtistsResolver implements Resolve<any> {
  constructor(private service: MusicExplorerService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.getArtists();
  }
}

@Injectable()
export class AlbumResolver implements Resolve<any> {
  constructor(private service: MusicExplorerService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.getArtistAlbums(route.paramMap.get('artist'));
  }
}

@Injectable()
export class AlbumDetailResolver implements Resolve<any> {
  constructor(private service: MusicExplorerService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.getAlbumDetail(route.paramMap.get('artist'), route.paramMap.get('album'));
  }
}
