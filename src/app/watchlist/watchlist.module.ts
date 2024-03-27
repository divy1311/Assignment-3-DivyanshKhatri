import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    WatchlistComponent
  ],
  imports: [
    CommonModule,
    NgbAlert,
    MatProgressSpinnerModule
  ]
})
export class WatchlistModule { }
