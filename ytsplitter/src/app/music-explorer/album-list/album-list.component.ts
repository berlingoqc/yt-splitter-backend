import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-album-list',
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.scss']
})
export class AlbumListComponent implements OnInit {

  artist: string;
  list: Observable<any>;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.artist = this.activatedRoute.snapshot.params.artist;
    this.list = this.activatedRoute.data.pipe(map(x=> x.albums));
  }

}
