import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
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

HC_SMA(HighchartsHighStock);
HC_volume(HighchartsHighStock);

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrl: './search-details.component.css',
})
export class SearchDetailsComponent implements OnInit, AfterViewInit {
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

  alerts: Alert[] = [
  ];

  close(alert: Alert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

  viewCard(news: any) {
    this.selectedNews = news;
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  selectedNews: News = {} as News;

  formControl = new FormControl();

  isLoading: boolean = false;

  stock: Stock = {} as Stock;

  chart: Chart[] = [] as Array<Chart>;

  quote: Quote = {} as Quote;

  chartValues: [number, number][] = [];

  volumeValues: [number, number][] = [];

  candleValues: [number, number, number, number, number][] = [];

  active = 1;

  sentiments: number[] = [0, 0, 0, 0, 0, 0];

  Highcharts: typeof HighchartsHighStock = HighchartsHighStock;
  chartOptions: Highcharts.Options = {
  };

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
    private modalService: NgbModal
  ) {}

  filteredStocks!: Observable<StockDetail[]>;

  ngAfterViewInit(): void {
    this.createGraph();
    this.createStackedColumnGraph();
    this.createSplineChart();
  }

  ngOnInit() {
    console.log('Reached here');
    this.route.params.forEach((param) => {
      this.formControl.setValue(param['ticker']);
      this.search();
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

  search(): void {
    let ticker = this.formControl.value;
    console.log("ticker value " + ticker);
    if (ticker === '') {
      this.alerts.push({
        type: 'danger',
        message: 'Please enter a valid ticker',
      });
      return;
    }
    this.router.navigate(['/search', this.formControl.value]);
    this.homeService.search(ticker).subscribe((data) => {
      this.stock = data;
    });

    this.homeService.chart(ticker, 'true').subscribe((data) => {
      this.chart = data.results;
      this.chartValues = [];
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
            threshold: null,
          },
        ],
      };
      this.updateFlag1 = true;
    });

    this.homeService.quote(ticker).subscribe((data) => {
      this.quote = data;
    });

    this.homeService.companyPeers(ticker).subscribe((data) => {
      this.stock.peers = data.filter((peer) => {
        return !peer.includes('.');
      });
    });

    this.homeService.news(ticker).subscribe((data) => {
      this.stock.news = data
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
      console.log(this.stock.news);
    });

    this.homeService.sentiments(ticker).subscribe((data) => {
      this.stock.sentiments = data;
      console.log(this.stock.sentiments);
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
    console.log(this.sentiments);

    this.cdr.detectChanges();
  }

  navigateToHome(): void {
    this.router.navigate(['/search/home']);
  }

  createGraph(): void {
    let ticker = this.formControl.value;
    this.homeService.chart(ticker, 'false').subscribe((data) => {
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
  }

  isEmptyObject(obj: Object): boolean {
    return Object.keys(obj).length === 0;
  }

  changeTimeFormat(time: number): string {
    const date = new Date(time * 1000);
    return date.toLocaleString();
  }
}
