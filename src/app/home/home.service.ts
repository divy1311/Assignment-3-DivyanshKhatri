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
import { StocksBought } from '../models/stocks-bought';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  oldTicker: string = '';

  constructor(private http: HttpClient, private dataService: DataService) {}

  checkIfTickerCorrect(stock: string): Observable<Stock> {
    console.log('reached here');
    let url = `http://localhost:3000/company?ticker=${stock}`;
    return this.http.get<Stock>(url);
  }

  search(stock: string): Observable<Stock> {
    let url = `http://localhost:3000/company?ticker=${stock}`;
    this.oldTicker = this.dataService.getTicker();
    if (this.oldTicker !== stock) {
      this.dataService.setTicker(stock);
    } else {
      return this.dataService.getStockData().pipe(
        take(1),
        switchMap((data) => {
          if (data && Object.keys(data).length !== 0) {
            console.log('fetched from cache: Stock Data');
            return of(data);
          } else {
            return this.fetchFromServerStock(url);
          }
        })
      );
    }

    return this.fetchFromServerStock(url);
  }

  private fetchFromServerStock(url: string): Observable<Stock> {
    return this.http.get<Stock>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Stock Data');
        this.dataService.setStockData(data);
      })
    );
  }

  chart(ticker: string, singleDay: string): Observable<any> {
    let url = `http://localhost:3000/chartData?ticker=${ticker}&singleDay=${singleDay}`;
    console.log(
      'new ticker = ' +
        ticker +
        ', old ticker = ' +
        this.dataService.getTicker()
    );
    if (this.oldTicker !== ticker) {
      return this.fetchFromServerChart(url);
    }

    return this.dataService.getChart().pipe(
      take(1),
      switchMap((data) => {
        if (data && Object.keys(data).length !== 0) {
          console.log('fetched from cache: Chart');
          return of(data);
        } else {
          return this.fetchFromServerChart(url);
        }
      })
    );
  }

  chart1(ticker: string, singleDay: string): Observable<any> {
    let url = `http://localhost:3000/chartData?ticker=${ticker}&singleDay=${singleDay}`;
    console.log(
      'new ticker = ' +
        ticker +
        ', old ticker = ' +
        this.dataService.getTicker()
    );
    if (this.oldTicker !== ticker) {
      return this.fetchFromServerChart1(url);
    }

    return this.dataService.getChart1().pipe(
      take(1),
      switchMap((data) => {
        if (data && Object.keys(data).length !== 0) {
          console.log('fetched from cache: Chart');
          return of(data);
        } else {
          return this.fetchFromServerChart1(url);
        }
      })
    );
  }

  private fetchFromServerChart(url: string): Observable<any> {
    return this.http.get<any>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Chart');
        this.dataService.setChart(data);
      })
    );
  }

  private fetchFromServerChart1(url: string): Observable<any> {
    return this.http.get<any>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Chart');
        this.dataService.setChart1(data);
      })
    );
  }

  quote(ticker: string): Observable<Quote> {
    let url = `http://localhost:3000/company/quote?ticker=${ticker}`;

    if (this.oldTicker !== ticker) {
      return this.fetchFromServerQuote(url);
    }

    return this.dataService.getQuote().pipe(
      take(1),
      switchMap((data) => {
        if (data && Object.keys(data).length !== 0) {
          console.log('fetched from cache: Quote');
          return of(data);
        } else {
          return this.fetchFromServerQuote(url);
        }
      })
    );
  }

  private fetchFromServerQuote(url: string): Observable<Quote> {
    return this.http.get<Quote>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Quote');
        this.dataService.setQuote(data);
      })
    );
  }

  stockNames(ticker: string): Observable<StockDetail[]> {
    let url = 'http://localhost:3000/company/names?ticker=' + ticker;
    return this.http.get<StockDetail[]>(url);
  }

  companyPeers(ticker: string): Observable<string[]> {
    let url = `http://localhost:3000/company/peers?ticker=${ticker}`;

    if (this.oldTicker !== ticker) {
      return this.fetchFromServerPeers(url);
    }

    return this.dataService.getPeers().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Peers');
          return of(data);
        } else {
          return this.fetchFromServerPeers(url);
        }
      })
    );
  }

  private fetchFromServerPeers(url: string): Observable<string[]> {
    return this.http.get<string[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Peers');
        this.dataService.setPeers(data);
      })
    );
  }

  news(ticker: string): Observable<News[]> {
    let url = `http://localhost:3000/company/news?ticker=${ticker}`;

    if (this.oldTicker !== ticker) {
      return this.fetchFromServerNews(url);
    }

    return this.dataService.getNews().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: News');
          return of(data);
        } else {
          return this.fetchFromServerNews(url);
        }
      })
    );
  }

  private fetchFromServerNews(url: string): Observable<News[]> {
    return this.http.get<News[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: News');
        this.dataService.setNews(data);
      })
    );
  }

  sentiments(ticker: string): Observable<Sentiments[]> {
    let url = `http://localhost:3000/company/sentiments?ticker=${ticker}`;

    if (this.oldTicker !== ticker) {
      return this.fetchFromServerSentiments(url);
    }

    return this.dataService.getSentiments().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Sentiments');
          return of(data);
        } else {
          return this.fetchFromServerSentiments(url);
        }
      })
    );
  }

  private fetchFromServerSentiments(url: string): Observable<Sentiments[]> {
    return this.http.get<Sentiments[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Sentiments');
        this.dataService.setSentiments(data);
      })
    );
  }

  earnings(ticker: string): Observable<Earnings[]> {
    let url = `http://localhost:3000/company/earnings?ticker=${ticker}`;

    if (this.oldTicker !== ticker) {
      return this.fetchFromServerEarnings(url);
    }

    return this.dataService.getEarnings().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Earnings');
          return of(data);
        } else {
          return this.fetchFromServerEarnings(url);
        }
      })
    );
  }

  private fetchFromServerEarnings(url: string): Observable<Earnings[]> {
    return this.http.get<Earnings[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Earnings');
        this.dataService.setEarnings(data);
      })
    );
  }

  trends(ticker: string): Observable<Trends[]> {
    let url = `http://localhost:3000/company/trends?ticker=${ticker}`;

    if (this.oldTicker !== ticker) {
      return this.fetchFromServerTrends(url);
    }

    return this.dataService.getTrends().pipe(
      take(1),
      switchMap((data) => {
        if (data && data.length !== 0) {
          console.log('fetched from cache: Trends');
          return of(data);
        } else {
          return this.fetchFromServerTrends(url);
        }
      })
    );
  }

  private fetchFromServerTrends(url: string): Observable<Trends[]> {
    return this.http.get<Trends[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Trends');
        this.dataService.setTrends(data);
      })
    );
  }

  getWallet(): Observable<string> {
    let url = `http://localhost:3000/getWallet`;
    return this.http.get<string>(url);
  }

  updateWallet(newAmount: number): Observable<any> {
    console.log('new amount = ' + newAmount);
    let url = `http://localhost:3000/updateWallet?amount=` + newAmount;
    return this.http.get(url);
  }

  stocksBought(): Observable<StocksBought[]> {
    let url = `http://localhost:3000/bought`;
    return this.http.get<StocksBought[]>(url);
  }

  checkStock(ticker: string): Observable<StocksBought> {
    let url = `http://localhost:3000/checkStock?ticker=${ticker}`;
    return this.http.get<StocksBought>(url);
  }

  sellStock(ticker: string, quantity: number): void {
    let url = `http://localhost:3000/sellStock?ticker=${ticker}&quantity=${quantity}`;
    this.http.get(url).subscribe();
  }
}
