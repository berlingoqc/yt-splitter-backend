import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MusicExplorerService } from 'src/app/music-explorer/music-explorer.service';
import { MusicPlayerService } from '../music-player.service';


export type PlayerState = 'notrack' | 'playing' | 'hidden';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  animations: [
    trigger('playing', [
      state('playing', style({
        opacity: 1
      })),
      state('notrack', style({
        opacity: 0,
        height: '0px',
      })),
      state('hidden', style({
        opacity: 0,
        height: '0px',
      })),
      transition('* => *', [
        animate('1s')
      ])
    ])
  ]
})
export class PlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('audio') audio: ElementRef<HTMLAudioElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  state: PlayerState = 'notrack';

  constructor(
    public musicPlayer: MusicPlayerService,
    public explorer: MusicExplorerService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.musicPlayer.audio = this.audio.nativeElement;
    this.musicPlayer.audio.addEventListener('playing', () => {
      console.log('START PLAYING');
      this.state = 'playing';
    });
    this.musicPlayer.playerSubject.asObservable().subscribe((x) => {
      if(x === 'flush') {
        this.state = 'notrack';
      }
    });
  }

  changeExpandState() {
    this.state = this.state === 'hidden' ? 'playing' : 'hidden';
  }

  private createAnalyser() {
    const context = new AudioContext();
    const src = context.createMediaElementSource(this.musicPlayer.audio);
    const analyser = context.createAnalyser();
    var ctx = this.canvas.nativeElement.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = this.canvas.nativeElement.width;
    var HEIGHT = this.canvas.nativeElement.height;

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        var r = barHeight + (25 * (i/bufferLength));
        var g = 250 * (i/bufferLength);
        var b = 50;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
    renderFrame();

  }

}
