import { Component } from '@angular/core';
import { DataService } from './data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Assignment-3';

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) { }

  isSearchRoute() {
    const root = this.router.url.split('/')[1];
    return root === 'search';
  }

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
