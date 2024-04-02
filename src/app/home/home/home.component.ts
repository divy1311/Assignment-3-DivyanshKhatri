import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HomeService } from '../home.service';
import { Observable, debounceTime, finalize, map, switchMap, tap} from 'rxjs';
import { StockDetail } from '../../models/stock-detail';
import { Router } from '@angular/router';
import { Alert } from '../../models/alert';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  formControl = new FormControl();

  isLoading: boolean = false;

  constructor(private homeService: HomeService, private router: Router) { }

  filteredStocks!: Observable<StockDetail[]>;

  alerts: Alert[] = [
  ];

  alerts1: Alert[] = [

  ];

  close(alert: Alert) {
		this.alerts = [];
	}

  ngOnInit() {
    this.filteredStocks = this.formControl.valueChanges.pipe(
      debounceTime(300),
      tap(() => {
        this.isLoading = true;
      }),
      switchMap(value =>
        this.homeService.stockNames(value).pipe(
            map(stockDetailsArray => stockDetailsArray.filter(
              stockDetails => stockDetails.type === "Common Stock" && !stockDetails.displaySymbol.includes(".")
            )),
          finalize(() => {
            this.isLoading = false;
        })
        )
      )
    );
  }

  search(): void {
    let ticker = this.formControl.value;
    console.log("ticker value " + ticker);
    if (ticker === null || ticker === "" || ticker === undefined) {
      this.alerts.push({
        type: 'danger',
        message: 'Please enter a valid ticker',
      });
      return;
    }
    ticker = ticker.toUpperCase();
    this.homeService.search(ticker).pipe(
      finalize(() => {
        this.alerts1.push({
          type: 'danger',
          message: 'No data found. Please enter a valid Ticker',
        });
        return;
      })
    ).subscribe((data) => {
      this.router.navigate(['/search', this.formControl.value]);
    });
  }

  resetAlerts(): void {
    this.alerts = [];
    this.alerts1 = [];
  }

}

