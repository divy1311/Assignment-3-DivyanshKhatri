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
        console.log(data);
        if (data !== null && data !== undefined && Object.keys(data).length !== 0) {
          // If data is not null or undefined and not an empty object, return it
          console.log("fetched from cache");
          return of(data);
        } else {
          // If data is null or undefined, make the HTTP request
          let url = 'http://localhost:3000/company?ticker=' + stock;
          return this.http.get<Stock>(url).pipe(
            tap(data => {
              console.log("Fetched from server");
              this.dataService.setStockData(data)
            })
          );
        }
      })
    );
  }

  chart(ticker: string, singleDay: string): Observable<any> {
    let url = 'http://localhost:3000/chartData?ticker=' + ticker + '&singleDay=' + singleDay;
    return this.http.get<any>(url);
  }

  quote(ticker: string): Observable<Quote> {
    let url = 'http://localhost:3000/company/quote?ticker=' + ticker;
    return this.http.get<Quote>(url);
  }

  stockNames(ticker: string): Observable<StockDetail[]> {
    let url = 'http://localhost:3000/company/names?ticker=' + ticker;
    return this.http.get<StockDetail[]>(url);
  }

  companyPeers(ticker: string): Observable<string[]> {
    let url = "http://localhost:3000/company/peers?ticker=" + ticker;
    return this.http.get<string[]>(url);
  }

  news(ticker: string): Observable<News[]> {
    let url = "http://localhost:3000/company/news?ticker=" + ticker;
    return this.http.get<News[]>(url);
  }

  sentiments(ticker: string): Observable<Sentiments[]> {
    let url = "http://localhost:3000/company/sentiments?ticker=" + ticker;
    return this.http.get<Sentiments[]>(url);
  }

  earnings(ticker: string): Observable<Earnings[]> {
    let url = "http://localhost:3000/company/earnings?ticker=" + ticker;
    return this.http.get<Earnings[]>(url);
  }

  trends(ticker: string): Observable<Trends[]> {
    let url = "http://localhost:3000/company/trends?ticker=" + ticker;
    return this.http.get<Trends[]>(url);
  }
}
