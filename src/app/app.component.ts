import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Assignment-3';

  constructor(private dataService: DataService) { }

  ticker: string = "";
  isTickerPresent: boolean = false;

  checkTicker(): boolean {
    return this.isTickerPresent = this.ticker !== "";
  }

  saveTickerValue(): void {
    const ticker = this.dataService.getTicker();
    if (ticker !== "") {
      this.ticker = ticker;
      this.isTickerPresent = true;
    }
  }
}
