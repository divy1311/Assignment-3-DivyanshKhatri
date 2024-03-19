import { Injectable, OnInit } from '@angular/core';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { Stock } from '../models/stock';
import { HttpClient } from '@angular/common/http';
import { Quote } from '../models/quote';
import { StockDetail } from '../models/stock-detail';
import { News } from '../models/news';
import { Sentiments } from '../models/sentiments';
import { Earnings } from '../models/earnings';
import { Trends } from '../models/trends';
import { DataService } from '../data.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {


  constructor(private http: HttpClient, private dataService: DataService) {}

  search(stock: string): Observable<Stock> {
    this.dataService.setTicker(stock);
    return this.dataService.getStockData().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && Object.keys(data).length !== 0) {
          console.log("fetched from cache: Stock Data");
          return of(data);
        } else {
          let url = 'http://localhost:3000/company?ticker=' + stock;
          return this.http.get<Stock>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Stock Data");
              this.dataService.setStockData(data)
            })
          );
        }
      })
    );
  }

  chart(ticker: string, singleDay: string): Observable<any> {
    return this.dataService.getChart().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && Object.keys(data).length !== 0) {
          console.log("fetched from cache: Chart");
          return of(data);
        } else {
          let url = 'http://localhost:3000/chartData?ticker=' + ticker + '&singleDay=' + singleDay;
          return this.http.get<any>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Chart");
              this.dataService.setChart(data)
            })
          );
        }
      })
    );
  }

  quote(ticker: string): Observable<Quote> {
    return this.dataService.getQuote().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && Object.keys(data).length !== 0) {
          console.log("fetched from cache: Quote");
          return of(data);
        } else {
          let url = 'http://localhost:3000/company/quote?ticker=' + ticker;
          return this.http.get<Quote>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Quote");
              this.dataService.setQuote(data)
            })
          );
        }
      })
    );
  }

  stockNames(ticker: string): Observable<StockDetail[]> {
    let url = 'http://localhost:3000/company/names?ticker=' + ticker;
    return this.http.get<StockDetail[]>(url);
  }

  companyPeers(ticker: string): Observable<string[]> {
    return this.dataService.getPeers().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && data.length !== 0) {
          console.log("fetched from cache: Peers");
          return of(data);
        } else {
          let url = 'http://localhost:3000/company/peers?ticker=' + ticker;
          return this.http.get<string[]>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Peers");
              this.dataService.setPeers(data)
            })
          );
        }
      })
    );
  }

  news(ticker: string): Observable<News[]> {
    return this.dataService.getNews().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && data.length !== 0) {
          console.log("fetched from cache: News");
          return of(data);
        } else {
          let url = "http://localhost:3000/company/news?ticker=" + ticker;
          return this.http.get<News[]>(url).pipe(
            tap(data => {
              console.log("Fetched from server: News");
              this.dataService.setNews(data)
            })
          );
        }
      })
    );
  }

  sentiments(ticker: string): Observable<Sentiments[]> {
    return this.dataService.getSentiments().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && data.length !== 0) {
          console.log("fetched from cache: Sentiments");
          return of(data);
        } else {
          let url = "http://localhost:3000/company/sentiments?ticker=" + ticker;
          return this.http.get<Sentiments[]>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Sentiments");
              this.dataService.setSentiments(data)
            })
          );
        }
      })
    );
  }

  earnings(ticker: string): Observable<Earnings[]> {
    return this.dataService.getEarnings().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && data.length !== 0) {
          console.log("fetched from cache: Earnings");
          return of(data);
        } else {
          let url = "http://localhost:3000/company/earnings?ticker=" + ticker;
          return this.http.get<Earnings[]>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Earnings");
              this.dataService.setEarnings(data)
            })
          );
        }
      })
    );
  }

  trends(ticker: string): Observable<Trends[]> {
    return this.dataService.getTrends().pipe(
      take(1),
      switchMap(data => {
        if (data !== null && data !== undefined && data.length !== 0) {
          console.log("fetched from cache: Trends");
          return of(data);
        } else {
          let url = "http://localhost:3000/company/trends?ticker=" + ticker;
          return this.http.get<Trends[]>(url).pipe(
            tap(data => {
              console.log("Fetched from server: Trends");
              this.dataService.setTrends(data)
            })
          );
        }
      })
    );
  }
}
