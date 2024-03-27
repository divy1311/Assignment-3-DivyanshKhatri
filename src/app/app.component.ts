import { Component } from '@angular/core';
import { DataService } from './data.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Assignment-3';
  isMenuCollapsed = true;
  selectedItem: string = "search";
  constructor(private router: Router, private dataService: DataService) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.selectedItem = event.urlAfterRedirects.split('/')[1];
    });
  }

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
