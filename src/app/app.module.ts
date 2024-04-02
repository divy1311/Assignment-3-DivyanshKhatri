import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SearchDetailsModule } from './SearchDetails/search-details.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { HomeModule } from './home/home.module';

import { HttpClientModule } from '@angular/common/http';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HighchartsChartModule } from 'highcharts-angular';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SearchDetailsModule,
    PortfolioModule,
    WatchlistModule,
    HttpClientModule,
    HomeModule,
    RouterModule,
    NgbModule,
    HighchartsChartModule,
    NgbModalModule
  ],
  providers: [
    provideAnimationsAsync()

    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
