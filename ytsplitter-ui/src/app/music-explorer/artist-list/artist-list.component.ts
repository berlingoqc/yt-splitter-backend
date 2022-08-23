import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-artist-list',
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss']
})
export class ArtistListComponent implements OnInit {

  list: Observable<any>;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.list = this.activatedRoute.data.pipe(map(x=> x.artists));
  }

}
