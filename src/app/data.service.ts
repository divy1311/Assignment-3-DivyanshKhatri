import { Injectable } from '@angular/core';
import { Stock } from './models/stock';
import { Quote } from './models/quote';
import { Observable, of } from 'rxjs';
import { News } from './models/news';
import { Sentiments } from './models/sentiments';
import { Earnings } from './models/earnings';
import { Trends } from './models/trends';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  private quote: Quote = {} as Quote;
  private stockData: Stock = {} as Stock;
  private ticker: string = "";
  private chart: any = {};
  private peers: string[] = [];
  private news: News[] = [];
  private sentiments: Sentiments[] = [];
  private earnings: Earnings[] = [];
  private trends: Trends[] = [];

  setStockData(data: Stock): void {
    this.stockData = data;
  }

  getStockData(): Observable<Stock> {
    return of(this.stockData);
  }

  setQuote(quote: Quote): void {
    this.quote = quote;
  }

  getQuote(): Observable<Quote> {
    return of(this.quote);
  }

  setTicker(ticker: string): void {
    this.ticker = ticker;
  }

  getTicker(): string {
    return this.ticker;
  }

  setChart(chart: any): void {
    this.chart = chart;
  }

  getChart(): Observable<any> {
    return of(this.chart);
  }

  setPeers(peers: string[]): void {
    this.peers = peers;
  }

  getPeers(): Observable<string[]> {
    return of(this.peers);
  }

  setNews(news: News[]): void {
    this.news = news;
  }

  getNews(): Observable<News[]> {
    return of(this.news);
  }

  setSentiments(sentiments: Sentiments[]): void {
    this.sentiments = sentiments;
  }

  getSentiments(): Observable<Sentiments[]> {
    return of(this.sentiments);
  }

  setEarnings(earnings: Earnings[]): void {
    this.earnings = earnings;
  }

  getEarnings(): Observable<Earnings[]> {
    return of(this.earnings);
  }

  setTrends(trends: Trends[]): void {
    this.trends = trends;
  }

  getTrends(): Observable<Trends[]> {
    return of(this.trends);
  }
}
