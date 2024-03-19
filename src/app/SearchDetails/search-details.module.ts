import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';;
import { NgbModalModule, NgbNavModule, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HighchartsChartModule } from 'highcharts-angular';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SearchDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgbNavModule,
    HighchartsChartModule,
    RouterModule,
    NgbAlert,
    NgbModalModule
  ]
})
export class SearchDetailsModule { }
