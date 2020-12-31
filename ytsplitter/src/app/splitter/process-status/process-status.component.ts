import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ContextService } from 'src/app/service/context.service';
import { SplitterService } from '../splitter.service';


interface Item {
  name: string;
  complete: boolean;
}
@Component({
  selector: 'app-process-status',
  templateUrl: './process-status.component.html',
  styleUrls: ['./process-status.component.scss']
})
export class ProcessStatusComponent implements OnInit, OnDestroy {

  status: {name?: string; error?: any; queue: [];items: {operation: string, complete: boolean}[]} = {
    name: '',
    items: [],
    queue: []
  }


  ffmpegStatus = [];


  source: EventSource;

  constructor(private change: ChangeDetectorRef, private splitterService: SplitterService, private context: ContextService) {
  }

  ngOnInit(): void {
     const source = new EventSource(`${this.context.url}/events`);
      source.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log(msg);
        if(msg.type === 'splitter') {
          this.status = msg.data;
        } else if(msg.type === 'ffmpeg') {
          this.ffmpegStatus = [msg.data];
        }
        this.change.detectChanges();
      }
      source.onerror = (event) => {
      }
    this.source = source;
  }

  ngOnDestroy(): void {
    this.source.close();
  }

}
