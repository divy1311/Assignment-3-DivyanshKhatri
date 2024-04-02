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
  private tickersVisited: string[] = [];
  private chart: any = {};
  private chart1: any = {};
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

  getTickersVisited(): string[] {
    return this.tickersVisited;
  }

  setTickersVisited(ticker: string): void {
    this.tickersVisited.push(ticker);
  }

  getQuote(): Observable<Quote> {
    return of(this.quote);
  }

  setChart(chart: any): void {
    this.chart = chart;
  }

  getChart(): Observable<any> {
    return of(this.chart);
  }

  setChart1(chart1: any): void {
    this.chart1 = chart1;
  }

  getChart1(): Observable<any> {
    return of(this.chart1);
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

  setAllToDefault(): void {
    this.tickersVisited = [];
    this.quote = {} as Quote;
    this.stockData = {} as Stock;
    this.chart = {};
    this.peers = [];
    this.news = [];
    this.sentiments = [];
    this.earnings = [];
    this.trends = [];
  }

  getAllDetails(): Observable<any> {
    return of({
      quote: this.quote,
      stockData: this.stockData,
      chart: this.chart,
      peers: this.peers,
      news: this.news,
      sentiments: this.sentiments,
      earnings: this.earnings,
      trends: this.trends,
    });
  }
}
