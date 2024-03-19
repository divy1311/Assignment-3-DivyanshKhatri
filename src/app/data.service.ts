import { Injectable } from '@angular/core';
import { Stock } from './models/stock';
import { Quote } from './models/quote';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  private quote: Quote = {} as Quote;
  private stockData: Stock = {} as Stock;
  private ticker: string = "";

  setStockData(data: Stock): void {
    this.stockData = data;
  }

  getStockData(): Observable<Stock> {
    return of(this.stockData);
  }

  setQuote(quote: Quote): void {
    this.quote = quote;
  }

  getQuote(): Quote {
    return this.quote;
  }

  setTicker(ticker: string): void {
    this.ticker = ticker;
  }

  getTicker(): string {
    return this.ticker;
  }
}
