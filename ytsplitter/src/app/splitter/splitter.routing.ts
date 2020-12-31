import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SplitterComponent } from './splitter/splitter.component';
import { SplitterHomeComponent } from './splitter-home/splitter-home.component';



@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SplitterHomeComponent,
      },
      {
        path: 'form',
        component: SplitterComponent,
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class SplitterRoutingModule { }
