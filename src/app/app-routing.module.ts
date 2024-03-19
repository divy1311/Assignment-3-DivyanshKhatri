import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchDetailsComponent } from './SearchDetails/search-details/search-details.component';
import { WatchlistComponent } from './watchlist/watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio/portfolio.component';
import { HomeComponent } from './home/home/home.component';

const routes: Routes = [
  {path: "", redirectTo: "/search/home", pathMatch: "full"},
  {path: "search/home", component: HomeComponent},
  {path: "search/:ticker", component: SearchDetailsComponent},
  {path: "watchlist", component: WatchlistComponent},
  {path: "portfolio", component: PortfolioComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
