import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { HomeService } from '../../home/home.service';
import { Stock } from '../../models/stock';
import { Chart } from '../../models/chart';
import { Quote } from '../../models/quote';
import { Observable, Subscription, debounceTime, finalize, map, switchMap, tap } from 'rxjs';
import { StockDetail } from '../../models/stock-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../../models/news';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import HC_SMA from 'highcharts/indicators/indicators';
import HC_volume from 'highcharts/indicators/volume-by-price';
import * as HighchartsHighStock from 'highcharts/highstock';
import { Alert } from '../../models/alert';
import { Sentiments } from '../../models/sentiments';
import { catchError, concatMap, exhaustAll, exhaustMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '../../data.service';
import { ThemePalette } from '@angular/material/core';
import { tick } from '@angular/core/testing';

HC_SMA(HighchartsHighStock);
HC_volume(HighchartsHighStock);

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrl: './search-details.component.css',
})
export class SearchDetailsComponent implements OnInit, AfterViewInit {
  parseInt(value: string) {
    return parseInt(value);
  }

  encodeURI(str: string): string {
    return encodeURIComponent(str);
  }

  getDate(isoDate: number) {
    let date = new Date(isoDate * 1000);
    const dateStr =
      date.getDate() +
      ' ' +
      date.toLocaleString('default', { month: 'long' }) +
      ' ' +
      date.getFullYear();
    return dateStr;
  }

  alerts: Alert[] = [];

  alerts1: Alert[] = [];

  watchlistAlert: Alert[] = [];

  buySellAlert: Alert[] = [];

  timeNow = Math.floor(Date.now() / 1000);

  quantity: number = 0;

  sellQuantity: number = 0;

  quantityBought: number = 0;

  wallet: number = 0;

  oldPrice: number = 0;

  displaySpinner = true;

  isMarketClosed = true;

  color: ThemePalette = 'primary';

  close(alert: Alert) {
    this.alerts = [];
    this.watchlistAlert = [];
  }

  closeBuySellAlert(alert: Alert) {
    this.buySellAlert = [];
  }

  @ViewChild('scrollableList') scrollableList!: ElementRef;
  @ViewChild('scrollableElement') scrollableElement!: ElementRef;

  ngAfterViewInit() {
    this.createStackedColumnGraph();
    this.createSplineChart();
  }

  scrollLeft() {
    this.scrollableList.nativeElement.scrollBy({
      left: -100,
      behavior: 'smooth',
    });
  }

  scrollRight() {
    this.scrollableList.nativeElement.scrollBy({
      left: 100,
      behavior: 'smooth',
    });
  }

  viewCard(news: any) {
    this.selectedNews = news;
  }

  open1(content: any) {
    let ticker: string = this.formControl.value;
    ticker = ticker.toUpperCase();
    this.modalService.open(content, { ariaLabelledBy: 'modal-buy' });
    this.homeService.getWallet().subscribe((data) => {
      this.quantity = 0;
      this.wallet = parseFloat(parseFloat(data).toFixed(2));
      this.homeService
        .checkStock(ticker, this.stock.name)
        .subscribe((data) => {
          console.log(data.quantity);
          this.quantityBought = data.quantity;
          this.oldPrice = data.price;
        });
    });
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  buyStock(newAmount: number, newQuantity: number, avgPrice: number) {
    let ticker: string = this.formControl.value;
    ticker = ticker.toUpperCase();
    console.log('New Quantity: ' + newQuantity);
    console.log('Avg Price: ' + avgPrice);
    this.homeService
      .updateWallet(newAmount)
      .pipe(
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.homeService.updateStock(
          ticker,
          this.stock.name,
          newQuantity,
          avgPrice
        );
        this.displaySell = true;
      });
    this.buySellAlert.push({
      type: 'success',
      message: ticker + ' bought successfully.',
    });
    setTimeout(() => {
      this.buySellAlert = [];
    }, 3000)
    this.modalService.dismissAll();
  }

  sellStock(amount: number, newQuantity: number) {
    let ticker = this.formControl.value;
    ticker = ticker.toUpperCase();
    console.log('New Quantity: Sell: ' + newQuantity);
    this.homeService
      .updateWallet(amount)
      .pipe(
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.homeService.updateStock(
          ticker,
          this.stock.name,
          newQuantity,
          this.oldPrice
        );
      });
    this.buySellAlert.push({
      type: 'danger',
      message: ticker + ' sold successfully.',
    });
    setTimeout(() => {
      this.buySellAlert = [];
    }, 3000)
    this.homeService.stocksBought().subscribe((data) => {
      let found = false;
      if (data.length !== 0) {
        data.forEach((s) => {
          if (ticker === s.stock && s.quantity == 0) {
            found = true;
            this.displaySell = false;
          }
        });
        if (!found) {
          this.displaySell = false;
        }
      }
    });
    this.modalService.dismissAll();
  }

  calculateAvgPrice(
    newQuantity: number,
    newPrice: number,
    currentQuantity: number,
    oldPrice: number
  ): number {
    console.log('New Quantity: ' + newQuantity);
    console.log('New Price: ' + newPrice);
    console.log('Current Quantity: ' + currentQuantity);
    console.log('Old Price: ' + oldPrice);
    return (
      (newQuantity * newPrice + currentQuantity * oldPrice) /
      (currentQuantity + newQuantity)
    );
  }

  open2(content: any) {
    let ticker: string = this.formControl.value;
    ticker = ticker.toUpperCase();
    this.modalService.open(content, { ariaLabelledBy: 'modal-sell' });
    this.homeService.getWallet().subscribe((data) => {
      this.wallet = parseFloat(parseFloat(data).toFixed(2));
      this.homeService
        .checkStock(ticker, this.stock.name)
        .subscribe((data) => {
          this.sellQuantity = 0;
          this.quantityBought = data.quantity;
        });
    });
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  selectedNews: News = {} as News;

  formControl = new FormControl();

  watchlistPressed = false;

  isLoading: boolean = false;

  stock: Stock = {} as Stock;

  chart: Chart[] = [] as Array<Chart>;

  quote: Quote = {} as Quote;

  chartValues: [number, number][] = [];

  volumeValues: [number, number][] = [];

  candleValues: [number, number, number, number, number][] = [];

  active = 1;

  peers: String[] = [];

  newsValues: News[] = [];

  sentimentsValues: Sentiments[] = [];

  sentiments: number[] = [0, 0, 0, 0, 0, 0];

  marketClosed: boolean = false;

  time: number = 0;

  Highcharts: typeof HighchartsHighStock = HighchartsHighStock;

  chartOptions: Highcharts.Options = {};

  renderChart = false;

  chartOptions1: Highcharts.Options = {
    series: [
      {
        name: 'Stock Price',
        data: this.chartValues,
        type: 'line',
        threshold: null,
      },
    ],
  };

  wrongStock = false;

  displaySell = false;

  displaySummaryChart = false;

  displayChart = false;

  chartOptions2: Highcharts.Options = {};

  chartOptions3: Highcharts.Options = {};

  updateFlag1: boolean = false;
  updateFlag2: boolean = false;
  updateFlag3: boolean = false;
  updateFlag4: boolean = false;
  oneToOneFlag: boolean = true;
  runOutsideAngular: boolean = false;

  constructor(
    private homeService: HomeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private dataService: DataService
  ) {}

  filteredStocks!: Observable<StockDetail[]>;

  changePositive = false;

  ngOnInit() {

    this.route.params.subscribe((params) => {
      if (params['peer']) {
        let peer = params['peer'];
        this.formControl.setValue(peer);
        this.search();
      } else {
        this.formControl.valueChanges.pipe(
          debounceTime(300),
        ).subscribe(value => {
          this.isLoading = true;
          this.homeService.stockNames(value).subscribe(stockDetailsArray => {
            this.filteredStocks = of(stockDetailsArray.filter(
              stockDetails =>
                stockDetails.type === 'Common Stock' &&
                !stockDetails.displaySymbol.includes('.')
            ));
            this.isLoading = false;
          });
        });
      }
    });

    this.updateTimeNow();
    setInterval(() => this.updateTimeNow(), 15000);

    setInterval(() => this.updateQuote(), 15000);

    this.route.params.forEach((param) => {
      this.formControl.setValue(param['ticker'].toUpperCase());
      this.search();
    });
    this.homeService.stocksBought().subscribe((data) => {
      let ticker = this.formControl.value;
      ticker = ticker.toUpperCase();
      if (data.length !== 0) {
        data.forEach((s) => {
          if (ticker === s.stock && s.quantity > 0) {
            this.displaySell = true;
            this.quantityBought = s.quantity;
            this.oldPrice = s.price;
          }
        });
      }
    });
    this.homeService.getWatchlist().subscribe((data) => {
      let ticker = this.formControl.value;
      ticker = ticker.toUpperCase();
      console.log(JSON.stringify(data));
      data.forEach((watchlist) => {
        if (watchlist.ticker.toUpperCase() === ticker) {
          this.watchlistPressed = true;
        }
      });
    });
  }

  updateTimeNow() {
    this.timeNow = Date.now();
  }

  canScrollLeft(element: HTMLElement): boolean {
    return element.scrollLeft > 0;
  }

  updateQuote(): void {
    this.homeService.quoteEvery15Sec(this.formControl.value).subscribe((data) => {
      this.quote = data;
      console.log('Time: ' + data.t * 1000 + "current time: " + Date.now());
      if (Math.abs(data.t * 1000 - Date.now()) > 300*1000) {
        this.marketClosed = true;
      } else {
        this.marketClosed = false;
      }
      this.time = data.t * 1000;
    });
  }

  watchlist(): void {
    let ticker: string = this.formControl.value;
    ticker = ticker.toUpperCase();
    this.watchlistPressed = !this.watchlistPressed;
    if (this.watchlistPressed) {
      this.homeService
        .addToWatchlist(ticker, this.stock.name)
        .subscribe();
      this.watchlistAlert.push({
        type: 'success',
        message: ticker + ' added to watchlist.',
      });
    } else {
      this.homeService.removeFromWatchlist(ticker).subscribe();
      this.watchlistAlert.push({
        type: 'danger',
        message: ticker + ' removed from watchlist.',
      });
    }
  }

  search(): void {
    this.alerts = [];
    this.alerts1 = [];
    let ticker = this.formControl.value;
    this.watchlistPressed = false;
    this.displaySpinner = false;
    if (ticker === '') {
      this.alerts.push({
        type: 'danger',
        message: 'Please enter a valid ticker',
      });
      return;
    }
    ticker = ticker.toUpperCase();
    this.displaySell = false;
    this.homeService.stocksBought().subscribe((data) => {
      if (data.length !== 0) {
        data.forEach((s) => {
          if (ticker === s.stock && s.quantity > 0) {
            this.displaySell = true;
          }
        });
      }
    });

    this.homeService
      .checkIfTickerCorrect(ticker.toUpperCase())
      .pipe(
        catchError((error) => {
          console.log('API call failed: ', error);
          this.wrongStock = true;
          this.alerts1.push({
            type: 'danger',
            message: 'No data found. Please enter a valid Ticker',
          });
          this.dataService.setAllToDefault();
          return of(null);
        })
      )
      .subscribe();

    this.displayData(ticker);
  }

  displayData(ticker: string): void {
    ticker = ticker.toUpperCase();
    this.router.navigate(['/search', ticker]);
    this.homeService.search(ticker).subscribe((data) => {
      this.stock = data;
    });

    this.homeService.quote(ticker).subscribe((data) => {
      this.quote = data;
      console.log('Time: ' + data.t * 1000 + "current time: " + Date.now(), "difference =", data.t * 1000 - Date.now());
      if (Math.abs(data.t * 1000 - Date.now()) > 300*1000) {
        this.marketClosed = true;
      } else {
        this.marketClosed = false;
      }
      if(data.d >= 0) {
        this.changePositive = true;
      } else {
        this.changePositive = false;
      }
      this.time = data.t * 1000;
    });

    this.homeService
      .chart(ticker, 'true')
      .pipe(
        catchError((error) => {
          console.log('API call failed: ', error);
          this.dataService.setAllToDefault();
          return of(null);
        })
      )
      .subscribe((data) => {
        this.chart = data.results;
        this.chartValues = [];
        console.log(Date.now() - data.t * 1000);
        this.chart.forEach((d) => {
          this.chartValues.push([d['t'], d['c']]);
        });
        this.chartOptions = {
          accessibility: {
            enabled: true,
          },
          title: {
            text: ticker + ' Hourly Price Variation',
          },
          chart: {
            backgroundColor: 'rgb(248, 248, 248)',
          },
          yAxis: {
            title: {
              text: 'Stock Price',
            },
            opposite: true,
          },
          xAxis: {
            type: 'datetime',
          },
          series: [
            {
              id: 'stock',
              name: 'Stock Price',
              data: this.chartValues,
              type: 'line',
              color: this.changePositive ? 'green' : 'red',
              threshold: null,
              marker: {
                enabled: false,
              },
            },
          ],
        };
        this.displaySummaryChart = true;
        this.updateFlag1 = true;
      });

    this.homeService
      .companyPeers(ticker)
      .pipe(
        catchError((error) => {
          console.log('API call failed: ', error);
          this.dataService.setAllToDefault();
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data) {
          this.peers = data.filter((peer) => {
            return !peer.includes('.');
          });
        }
      });

    this.homeService.news(ticker).subscribe((data) => {
      this.newsValues = data
        .filter((n) => {
          return (
            n.summary &&
            n.summary.trim() !== '' &&
            n.headline &&
            n.headline.trim() !== '' &&
            n.image &&
            n.image.trim() !== '' &&
            n.url &&
            n.url.trim() !== '' &&
            n.source &&
            n.source.trim() !== '' &&
            n.datetime !== null
          );
        })
        .slice(0, 20);
    });

    this.homeService.sentiments(ticker).subscribe((data) => {
      this.sentimentsValues = data;
      data.forEach((s) => {
        if (s.change < 0) {
          this.sentiments[5] += s.change;
        }
        if (s.change >= 0) {
          this.sentiments[4] += s.change;
        }
        if (s.mspr < 0) {
          this.sentiments[2] += s.mspr;
        }
        if (s.mspr >= 0) {
          this.sentiments[1] += s.mspr;
        }
        this.sentiments[3] += s.change;
        this.sentiments[0] += s.mspr;
      });
    });
    this.createStackedColumnGraph();
    this.createSplineChart();
    this.createGraph();
    this.cdr.detectChanges();
  }

  navigateToHome(): void {
    this.dataService.setAllToDefault();
    this.router.navigate(['/search/home']);
  }

  createGraph(): void {
    let ticker = this.formControl.value;
    ticker = ticker.toUpperCase();
    this.homeService
      .chart1(ticker, 'false')
      .pipe(
        catchError((error) => {
          console.log('API call failed: ', error);
          this.dataService.setAllToDefault();
          return of(null);
        })
      )
      .subscribe((data) => {
        this.chart = data.results;
        let candleStickValues: number[][] = [];
        let volumeValues: number[][] = [];
        this.chart.forEach((d) => {
          candleStickValues.push([d['t'], d['o'], d['h'], d['l'], d['c']]);
        });
        this.chart.forEach((d) => {
          volumeValues.push([d['t'], d['v']]);
        });
        this.chartOptions1 = {
          title: {
            text: ticker + ' Historical',
          },
          subtitle: {
            text: 'With SMA and Volume by Price technical indicators',
          },
          chart: {
            backgroundColor: 'rgb(248, 248, 248)',
          },
          yAxis: [
            {
              labels: {
                align: 'right',
                x: -3,
              },
              title: {
                text: 'OHLC',
              },
              height: '60%',
              lineWidth: 2,
              lineColor: 'black',
              offset: 2,
              resize: {
                enabled: true,
              },
              opposite: true,
            },
            {
              labels: {
                align: 'right',
                x: -3,
                y: -10,
              },
              title: {
                text: 'Volume',
              },

              top: '65%',
              height: '35%',
              offset: 2,
              lineWidth: 2,
              lineColor: 'black',
              opposite: true,
            },
          ],
          xAxis: {
            type: 'datetime',
            ordinal: true,
          },
          tooltip: {
            split: true,
          },
          rangeSelector: {
            enabled: true,
            selected: 2,
            buttons: [
              {
                type: 'month',
                count: 1,
                text: '1M',
              },
              {
                type: 'month',
                count: 3,
                text: '3M',
              },
              {
                type: 'month',
                count: 6,
                text: '6M',
              },
              {
                type: 'ytd',
                text: 'YTD',
              },
              {
                type: 'year',
                count: 1,
                text: '1Y',
              },
              {
                type: 'all',
                text: 'All',
              },
            ],
          },
          navigator: {
            enabled: true,
            series: {
              type: 'line',
              data: candleStickValues,
            },

          },
          series: [
            {
              id: 'candlestick',
              type: 'candlestick',
              data: candleStickValues,
              yAxis: 0,
            },
            {
              id: 'sma',
              type: 'sma',
              linkedTo: 'candlestick',
              params: {
                period: 14,
              },
              yAxis: 0,
              color: 'orange',
              marker: {
                enabled: false,
              },
            },
            {
              id: 'volume',
              type: 'column',
              linkedTo: 'candlestick',
              data: volumeValues,
              yAxis: 1,
              color: 'rgb(83, 71, 189)',
            },
            {
              id: 'vbp',
              type: 'vbp',
              linkedTo: 'candlestick',
              params: {
                volumeSeriesID: 'volume',
              },
              zoneLines: {
                enabled: false,
              },
              dataLabels: {
                enabled: false,
              },
            },
          ],
          legend: {
            enabled: false
          }
        };
        this.displayChart = true;
        this.updateFlag2 = true;
      });
  }

  createStackedColumnGraph(): void {
    console.log('Creating stacked column graph');
    let ticker = this.formControl.value;
    ticker = ticker.toUpperCase();
    let strongBuy: number[] = [];
    let buy: number[] = [];
    let hold: number[] = [];
    let sell: number[] = [];
    let strongSell: number[] = [];
    let periods: string[] = [];
    this.homeService.trends(ticker).subscribe((data) => {
      data.forEach((trend) => {
        strongBuy.push(trend.strongBuy);
        buy.push(trend.buy);
        hold.push(trend.hold);
        sell.push(trend.sell);
        strongSell.push(trend.strongSell);
        periods.push(
          new Date(trend.period).getFullYear().toString() +
            '-' +
            (new Date(trend.period).getMonth() + 1).toString()
        );
      });
      let max = -1;
      for (let i = 0; i < strongBuy.length; i++) {
        let sum = strongBuy[i] + buy[i] + hold[i] + sell[i] + strongSell[i];
        if (sum > max) {
          max = sum;
        }
      }
      max *= 1.5;

      this.chartOptions2 = {
        chart: {
          type: 'column',
          height: 400,
          backgroundColor: 'rgb(248, 248, 248)',
        },
        title: {
          text: 'Recommendation Trends',
        },
        xAxis: {
          categories: periods,
        },
        yAxis: {
          min: 0,
          title: {
            text: '#Analysis',
          },
          stackLabels: {
            enabled: true,
          },
          max: max,
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
            },
          },
        },
        series: [
          {
            name: 'Strong Buy',
            data: strongBuy,
            color: 'rgb(24, 100, 55)',
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Buy',
            data: buy,
            color: 'rgb(30, 176, 87)'
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Hold',
            data: hold,
            color: 'rgb(176, 127, 52)'
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Sell',
            data: sell,
            color: 'rgb(241, 80, 87)'
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Strong Sell',
            data: strongSell,
            color: "rgb(117, 43, 46)"
          } as Highcharts.SeriesOptionsType,
        ],
      };
      this.updateFlag3 = true;
    });
  }

  createSplineChart(): void {
    console.log('Creating spline chart');
    let ticker = this.formControl.value;
    ticker = ticker.toUpperCase();
    this.homeService.earnings(ticker).subscribe((data) => {
      let earnings = data;
      let actual: number[] = [];
      let estimate: number[] = [];
      let periods: string[] = [];
      earnings.forEach((e) => {
        actual.push(e.actual);
        estimate.push(e.estimate);
        periods.push(e.period + '<br/> Surprise: ' + e.surprise);
      });
      this.chartOptions3 = {
        chart: {
          height: 400,
          type: 'spline',
          backgroundColor: 'rgb(248, 248, 248)',
        },
        title: {
          text: 'Historical EPS Surprises',
        },
        xAxis: {
          categories: periods,
          lineWidth: 2,
        },
        yAxis: {
          title: {
            text: 'Quarterly EPS',
          },
        },
        series: [
          {
            name: 'Actual',
            data: actual,
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Estimate',
            data: estimate,
            color: 'rgb(76, 69, 181)'
          } as Highcharts.SeriesOptionsType,
        ],
      };
      this.updateFlag4 = true;
    });
    this.updateFlag4 = true;
  }

  isEmptyObject(obj: Object): boolean {
    return Object.keys(obj).length === 0;
  }

  changeTimeFormat(time: number): string {
    const date = new Date(time * 1000);
    return date.toLocaleString();
  }

  changeTimeFormatLive(time: number): string {
    const date = new Date(time);
    return date.toLocaleString();
  }

  resetAlerts(): void {
    this.alerts = [];
    this.alerts1 = [];
    this.watchlistAlert = [];
  }
}
