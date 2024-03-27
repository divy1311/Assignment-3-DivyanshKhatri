import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { HomeService } from '../../home/home.service';
import { Stock } from '../../models/stock';
import { Chart } from '../../models/chart';
import { Quote } from '../../models/quote';
import { Observable, debounceTime, finalize, map, switchMap, tap } from 'rxjs';
import { StockDetail } from '../../models/stock-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../../models/news';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import HC_SMA from 'highcharts/indicators/indicators';
import HC_volume from 'highcharts/indicators/volume-by-price';
import * as HighchartsHighStock from 'highcharts/highstock';
import { Alert } from '../../models/alert';
import { Sentiments } from '../../models/sentiments';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '../../data.service';
import { ThemePalette } from '@angular/material/core';

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

  timeNow = Date.now();

  quantity: number = 0;

  sellQuantity: number = 0;

  quantityBought: number = 0;

  wallet: number = 0;

  oldPrice: number = 0;

  displaySpinner = true;

  color: ThemePalette = 'primary';

  close(alert: Alert) {
    this.alerts = [];
    this.watchlistAlert = [];
  }

  closeBuySellAlert(alert: Alert) {
    this.buySellAlert = [];
  }

  @ViewChild('scrollableList') scrollableList!: ElementRef;

  ngAfterViewInit() {
    this.createGraph();
    this.createStackedColumnGraph();
    this.createSplineChart();
  }


  scrollLeft() {
    this.scrollableList.nativeElement.scrollBy({ left: -100, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollableList.nativeElement.scrollBy({ left: 100, behavior: 'smooth' });
  }

  viewCard(news: any) {
    this.selectedNews = news;
  }

  open1(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-buy' });
    this.homeService.getWallet().subscribe((data) => {
      this.quantity = 0;
      this.wallet = parseInt(data);
      this.homeService
        .checkStock(this.formControl.value, this.stock.name)
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
          this.formControl.value,
          this.stock.name,
          newQuantity,
          avgPrice
        );
        this.displaySell = true;
      });
    this.buySellAlert.push({
      type: 'success',
      message: this.formControl.value + ' bought successfully.',
    });
    this.modalService.dismissAll();
  }

  sellStock(amount: number, newQuantity: number) {
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
          this.formControl.value,
          this.stock.name,
          newQuantity,
          this.oldPrice
        );
      });
    this.buySellAlert.push({
      type: 'danger',
      message: this.formControl.value + ' sold successfully.',
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-sell' });
    this.homeService.getWallet().subscribe((data) => {
      this.wallet = parseInt(data);
      this.homeService
        .checkStock(this.formControl.value, this.stock.name)
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

  ngOnInit() {
    this.route.params.forEach((param) => {
      this.formControl.setValue(param['ticker']);
      this.search();
    });
    this.homeService.stocksBought().subscribe((data) => {
      if (data.length !== 0) {
        data.forEach((s) => {
          if (this.formControl.value === s.stock && s.quantity > 0) {
            this.displaySell = true;
            this.quantityBought = s.quantity;
            this.oldPrice = s.price;
          }
        });
      }
    });
    this.homeService.getWatchlist().subscribe((data) => {
      console.log(JSON.stringify(data));
      data.forEach((watchlist) => {
        if (watchlist.ticker === this.formControl.value) {
          this.watchlistPressed = true;
        }
      });
    });
    this.route.params.subscribe((params) => {
      if (params['peer']) {
        let peer = params['peer'];
        this.formControl.setValue(peer);
        this.search();
      } else {
        this.filteredStocks = this.formControl.valueChanges.pipe(
          debounceTime(300),
          tap(() => {
            this.isLoading = true;
          }),
          switchMap((value) =>
            this.homeService.stockNames(value).pipe(
              map((stockDetailsArray) =>
                stockDetailsArray.filter(
                  (stockDetails) =>
                    stockDetails.type === 'Common Stock' &&
                    !stockDetails.displaySymbol.includes('.')
                )
              ),
              finalize(() => {
                this.isLoading = false;
              })
            )
          )
        );
      }
    });
  }

  watchlist(): void {
    this.watchlistPressed = !this.watchlistPressed;
    if (this.watchlistPressed) {
      this.homeService.addToWatchlist(this.formControl.value, this.stock.name).subscribe();
      this.watchlistAlert.push({
        type: 'success',
        message: this.formControl.value + ' added to watchlist.',
      });
    } else {
      this.homeService.removeFromWatchlist(this.formControl.value).subscribe();
      this.watchlistAlert.push({
        type: 'danger',
        message: this.formControl.value + ' removed from watchlist.',
      });
    }
  }

  search(): void {
    this.alerts = [];
    this.alerts1 = [];
    let ticker = this.formControl.value;
    this.watchlistPressed = false;
    if (ticker === '') {
      this.alerts.push({
        type: 'danger',
        message: 'Please enter a valid ticker',
      });
      return;
    }
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
      .checkIfTickerCorrect(ticker)
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
    this.router.navigate(['/search', this.formControl.value]);
    this.homeService.search(ticker).subscribe((data) => {
      this.stock = data;
    });

    this.homeService.quote(ticker).subscribe((data) => {
      this.displaySpinner = false;
      this.quote = data;
      if (data.t * 1000 - Date.now() > 300) {
        this.marketClosed = true;
      }
      this.time = data.t * 1000;
    });

    this.homeService.chart(ticker, 'true').subscribe((data) => {
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
            color: Date.now() - this.time > 300 ? 'red' : 'green',
            threshold: null,
            marker: {
              enabled: false,
            },
          },
        ],
      };
      this.updateFlag1 = true;
    });

    this.homeService.companyPeers(ticker).subscribe((data) => {
      this.peers = data.filter((peer) => {
        return !peer.includes('.');
      });
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

    this.cdr.detectChanges();
  }

  navigateToHome(): void {
    this.router.navigate(['/search/home']);
  }

  createGraph(): void {
    let ticker = this.formControl.value;
    this.homeService.chart1(ticker, 'false').subscribe((data) => {
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
          selected: 5,
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
      };
      this.updateFlag2 = true;
    });
  }

  createStackedColumnGraph(): void {
    console.log('Creating stacked column graph');
    let ticker = this.formControl.value;
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
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Buy',
            data: buy,
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Hold',
            data: hold,
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Sell',
            data: sell,
          } as Highcharts.SeriesOptionsType,
          {
            name: 'Strong Sell',
            data: strongSell,
          } as Highcharts.SeriesOptionsType,
        ],
      };
      this.updateFlag3 = true;
    });
  }

  createSplineChart(): void {
    console.log('Creating spline chart');
    let ticker = this.formControl.value;
    this.homeService.earnings(ticker).subscribe((data) => {
      let earnings = data;
      let actual: number[] = [];
      let estimate: number[] = [];
      let periods: string[] = [];
      earnings.forEach((e) => {
        actual.push(e.actual);
        estimate.push(e.estimate);
        periods.push(e.period + ' ' + e.surprise);
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


