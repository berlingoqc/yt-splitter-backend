import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { interval, Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { getHeaderAuth } from "../service/basic-auth.interceptor";
import { ContextService } from "../service/context.service";

export interface RequestSplitter {
  v: string;
}

@Injectable()
export class SplitterService {


  constructor(
    private httpClient: HttpClient,
    private context: ContextService,
  ) {
  }

  downloadObs: Observable<any>;
  downloadSub: Subscription;

  getVideoInfo(v: string): any {
    return this.httpClient.get(`${this.context.url}/info?v=${v}`)
  }

  download(request: RequestSplitter): any {
    return this.httpClient.post(`${this.context.url}/download`, request);
  }

  downloadEvent(): Observable<any> {
    return new Observable((sub) => {
      const source = new EventSource(`${this.context.url}/events`,{headers: getHeaderAuth(this.context.context.password)} as any);
      source.onmessage = (event) => {
        sub.next(event);
      }
      source.onerror = (event) => {
        sub.complete();
      }
    })
  }

  getHistory() {
    return this.httpClient.get<{ completed: any[], failed: any[]}>(`${this.context.url}/download/history`);
  }

  downloadEvent2(): Observable<any> {
    return interval(1000).pipe(
      switchMap(() => this.httpClient.get(`${this.context.url}/events/latest`))
    );
  }

  parseTimetrack(text): Observable<any[]> {
    return this.httpClient.post<any[]>(`${this.context.url}/parser/tracks`, { text });
  }

  async getTrackFromClipboard() {
    const queryOpts = { name: 'clipboard-read'} as any;
    const permissionStatus = await navigator.permissions.query(queryOpts);
    console.log('PERSMISSIONS STATUS', permissionStatus);
    const text = await navigator.clipboard.readText();
    return this.parseTimetrack(text).toPromise();
  }

}

