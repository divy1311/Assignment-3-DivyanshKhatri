import { Injectable } from '@angular/core';
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
import { Watchlist } from '../models/watchlist';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  oldTicker: string = '';
  backendUrl = 'https://assignment-3-backend.wl.r.appspot.com';
  // backendUrl = 'http://localhost:3000';
  constructor(private http: HttpClient, private dataService: DataService) {}

  checkIfTickerCorrect(stock: string): Observable<Stock> {
    let url = `${this.backendUrl}/company?ticker=${stock}`;
    return this.http.get<Stock>(url);
  }

  search(stock: string): Observable<Stock> {
    let url = `${this.backendUrl}/company?ticker=${stock}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerStock(url, stock);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === stock) {
        return this.dataService.getStockData().pipe(
          take(1),
          switchMap((data) => {
            if (data && Object.keys(data).length !== 0) {
              console.log('fetched from cache: Stock Data');
              return of(data);
            } else {
              return this.fetchFromServerStock(url, stock);
            }
          })
        );
      } else {
        this.dataService.setAllToDefault();
        return this.fetchFromServerStock(url, stock);
      }
    }
  }

  private fetchFromServerStock(url: string, stock: string): Observable<Stock> {
    return this.http.get<Stock>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Stock Data');
        this.dataService.setTickersVisited(stock);
        this.dataService.setStockData(data);
      })
    );
  }

  quote(ticker: string): Observable<Quote> {
    let url = `${this.backendUrl}/company/quote?ticker=${ticker}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerQuote(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getQuote().pipe(
          take(1),
          switchMap((data) => {
            if (data && Object.keys(data).length !== 0) {
              console.log('fetched from cache: Quote');
              return of(data);
            } else {
              return this.fetchFromServerQuote(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerQuote(url, ticker);
      }
    }
  }

  quoteEvery15Sec(ticker: string): Observable<Quote> {
    let url = `${this.backendUrl}/company/quote?ticker=${ticker}`;
    return this.http.get<Quote>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Quote');
        console.log('Setting quote data into cache')
        this.dataService.setQuote(data);
      })
    );
  }

  private fetchFromServerQuote(url: string, stock: string): Observable<Quote> {
    return this.http.get<Quote>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Quote');
        this.dataService.setQuote(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  companyPeers(ticker: string): Observable<string[]> {
    let url = `${this.backendUrl}/company/peers?ticker=${ticker}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerPeers(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getPeers().pipe(
          take(1),
          switchMap((data) => {
            if (data && data.length !== 0) {
              console.log('fetched from cache: Peers');
              return of(data);
            } else {
              return this.fetchFromServerPeers(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerPeers(url, ticker);
      }
    }
  }

  private fetchFromServerPeers(url: string, stock: string): Observable<string[]> {
    return this.http.get<string[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Peers');
        this.dataService.setPeers(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  news(ticker: string): Observable<News[]> {
    let url = `${this.backendUrl}/company/news?ticker=${ticker}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerNews(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getNews().pipe(
          take(1),
          switchMap((data) => {
            if (data && data.length !== 0) {
              console.log('fetched from cache: News');
              return of(data);
            } else {
              return this.fetchFromServerNews(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerNews(url, ticker);
      }
    }
  }

  private fetchFromServerNews(url: string, stock: string): Observable<News[]> {
    return this.http.get<News[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: News');
        this.dataService.setNews(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  sentiments(ticker: string): Observable<Sentiments[]> {
    let url = `${this.backendUrl}/company/sentiments?ticker=${ticker}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerSentiments(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getSentiments().pipe(
          take(1),
          switchMap((data) => {
            if (data && data.length !== 0) {
              console.log('fetched from cache: Sentiments');
              return of(data);
            } else {
              return this.fetchFromServerSentiments(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerSentiments(url, ticker);
      }
    }
  }

  private fetchFromServerSentiments(url: string, stock: string): Observable<Sentiments[]> {
    return this.http.get<Sentiments[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Sentiments');
        this.dataService.setSentiments(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  earnings(ticker: string): Observable<Earnings[]> {
    let url = `${this.backendUrl}/company/earnings?ticker=${ticker}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerEarnings(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getEarnings().pipe(
          take(1),
          switchMap((data) => {
            if (data && data.length !== 0) {
              console.log('fetched from cache: Earnings');
              return of(data);
            } else {
              return this.fetchFromServerEarnings(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerEarnings(url, ticker);
      }
    }
  }

  private fetchFromServerEarnings(url: string, stock: string): Observable<Earnings[]> {
    return this.http.get<Earnings[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Earnings');
        this.dataService.setEarnings(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  trends(ticker: string): Observable<Trends[]> {
    let url = `${this.backendUrl}/company/trends?ticker=${ticker}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerTrends(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getTrends().pipe(
          take(1),
          switchMap((data) => {
            if (data && data.length !== 0) {
              console.log('fetched from cache: Trends');
              return of(data);
            } else {
              return this.fetchFromServerTrends(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerTrends(url, ticker);
      }
    }
  }

  private fetchFromServerTrends(url: string, stock: string): Observable<Trends[]> {
    return this.http.get<Trends[]>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Trends');
        this.dataService.setTrends(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  chart(ticker: string, singleDay: string): Observable<any> {
    let url = `${this.backendUrl}/chartData?ticker=${ticker}&singleDay=${singleDay}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerChart(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getChart().pipe(
          take(1),
          switchMap((data) => {
            if (data && Object.keys(data).length !== 0) {
              console.log('fetched from cache: Chart');
              return of(data);
            } else {
              return this.fetchFromServerChart(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerChart(url, ticker);
      }
    }
  }

  private fetchFromServerChart(url: string, stock: string): Observable<any> {
    return this.http.get<any>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Chart');
        this.dataService.setChart(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  chart1(ticker: string, singleDay: string): Observable<any> {
    let url = `${this.backendUrl}/chartData?ticker=${ticker}&singleDay=${singleDay}`;

    let tickersVisited = this.dataService.getTickersVisited();
    if (tickersVisited.length === 0) {
      return this.fetchFromServerChart1(url, ticker);
    } else {
      if (tickersVisited[tickersVisited.length - 1] === ticker) {
        return this.dataService.getChart1().pipe(
          take(1),
          switchMap((data) => {
            if (data && Object.keys(data).length !== 0) {
              console.log('fetched from cache: Chart1');
              return of(data);
            } else {
              return this.fetchFromServerChart1(url, ticker);
            }
          })
        );
      } else {
        return this.fetchFromServerChart1(url, ticker);
      }
    }
  }

  private fetchFromServerChart1(url: string, stock: string): Observable<any> {
    return this.http.get<any>(url).pipe(
      tap((data) => {
        console.log('Fetched from server: Chart1');
        this.dataService.setChart1(data);
        this.dataService.setTickersVisited(stock);
      })
    );
  }

  quoteForPortfolio(ticker: string): Observable<Quote> {
    let url = `${this.backendUrl}/company/quote?ticker=${ticker}`;
    return this.http.get<Quote>(url);
  }

  stockNames(ticker: string): Observable<StockDetail[]> {
    let url = `${this.backendUrl}/company/names?ticker=` + ticker;
    return this.http.get<StockDetail[]>(url);
  }

  getWallet(): Observable<string> {
    let url = `${this.backendUrl}/getWallet`;
    return this.http.get<string>(url);
  }

  updateWallet(newAmount: number): Observable<any> {
    console.log('new amount = ' + newAmount);
    let url = `${this.backendUrl}/updateWallet?amount=` + newAmount;
    return this.http.get(url);
  }

  stocksBought(): Observable<StocksBought[]> {
    let url = `${this.backendUrl}/bought`;
    return this.http.get<StocksBought[]>(url);
  }

  checkStock(
    ticker: string,
    stockDescription: string
  ): Observable<StocksBought> {
    let url = `${this.backendUrl}/checkStock?ticker=${ticker}&stockDescription=${stockDescription}`;
    return this.http.get<StocksBought>(url);
  }

  updateStock(
    ticker: string,
    stockDescription: string,
    quantity: number,
    avgPrice: number
  ): void {
    let url = `${this.backendUrl}/updateStock?ticker=${ticker}&quantity=${quantity}&price=${avgPrice}&stockDescription=${stockDescription}`;
    this.http.get(url).subscribe();
  }

  updateStock1(
    ticker: string,
    stockDescription: string,
    quantity: number,
    avgPrice: number
  ): Observable<any> {
    let url = `${this.backendUrl}/updateStock?ticker=${ticker}&quantity=${quantity}&price=${avgPrice}&stockDescription=${stockDescription}`;
    return this.http.get(url);
  }

  addToWatchlist(ticker: string, stockDescription: string): Observable<any> {
    let url = `${this.backendUrl}/addToWatchlist?ticker=${ticker}&stockDescription=${stockDescription}`;
    return this.http.get(url);
  }

  removeFromWatchlist(ticker: string): Observable<any> {
    let url = `${this.backendUrl}/removeFromWatchlist?ticker=${ticker}`;
    return this.http.get(url);
  }

  getWatchlist(): Observable<Watchlist[]> {
    let url = `${this.backendUrl}/getWatchlist`;
    return this.http.get<Watchlist[]>(url);
  }
}
