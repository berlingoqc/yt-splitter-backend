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

  downloadEvent2(): Observable<any> {
    return interval(1000).pipe(
      switchMap(() => this.httpClient.get(`${this.context.url}/events/latest`))
    );
  }



  async getTrackFromClipboard() {
    const text = await navigator.clipboard.readText();
    const items = parseTimetrack(text);
    return items;
  }

}

const regex = /^([0-9]?[0-9]|2[0-9]):[0-9][0-9]$/

function parseTimetrack(text) {
  // SÉPARER LES LIGNES
  let lines = text.split('\n');
  // FLUSH LES LIGNES VIDES
  lines = lines.filter(x => x.length>0)

  return lines.map((l) => {
    const items = l.split(' ')
    let ss;
    for(let i of items) {
      if(i.match(regex)) {
          ss = i;
      }
    }
    const title = l.replace(ss, '').replace('/[|&;\:$%@"<>()\-+,]/g','').replace('-','').replace(':','').trim();
    return {ss, title }
  })
}
