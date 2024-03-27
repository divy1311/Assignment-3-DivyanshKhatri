import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../home/home.service';
import { Watchlist } from '../../models/watchlist';
import { Alert } from '../../models/alert';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css',
})
export class WatchlistComponent implements OnInit {
  constructor(private homeService: HomeService) {}
  color: ThemePalette = 'primary';
  watchlist: Watchlist[] = [];
  watchlistStocks: Map<string, number[]> = new Map();
  alerts: Alert[] = [];
  displaySpinner = true;
  ngOnInit(): void {
    this.homeService.getWatchlist().subscribe((data) => {
      this.displaySpinner = false;
      if(data.length === 0) {
          this.alerts.push({
            type: 'warning',
            message: "Currently you don't have any stock in your watchlist.",
          });
          return;
        }
      this.watchlist = data;
      data.forEach((stock) => {
        this.homeService.quoteForPortfolio(stock.ticker).subscribe((data) => {
          this.watchlistStocks.set(stock.ticker, [data.c, data.d, data.dp]);
        });
      });
    });
  }

  cross(ticker: string): void {
    this.homeService.removeFromWatchlist(ticker).subscribe(() => {
      this.watchlist = this.watchlist.filter(
        (stock) => stock.ticker !== ticker
      );
      if(this.watchlist.length === 0) {
        this.alerts.push({
          type: 'warning',
          message: "Currently you don't have any stock in your watchlist.",
        });
        return;
      }
    });
  }
  checkIfObjectEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  checkIfMapEmpty(map: Map<string, any[]>): boolean {
    return map.size === 0;
  }

}
