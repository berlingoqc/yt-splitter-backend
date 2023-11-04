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

  history: Observable<{ completed: any[], failed: any[]}>;

  ffmpegStatus = [];

  sub: Subscription;

  constructor(private change: ChangeDetectorRef, private splitterService: SplitterService, private context: ContextService) {
  }

  ngOnInit(): void {
    this.history = this.splitterService.getHistory();
    this.sub = this.splitterService.downloadEvent2().subscribe((msg) => {
        if(msg.type === 'splitter') {
          this.status = msg.data;
        } else if(msg.type === 'ffmpeg') {
          this.ffmpegStatus = [msg.data];
        }
        this.change.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
