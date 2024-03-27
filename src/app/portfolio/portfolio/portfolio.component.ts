import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HomeService } from '../../home/home.service';
import { StocksBought } from '../../models/stocks-bought';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Alert } from '../../models/alert';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css',
})
export class PortfolioComponent implements OnInit {
  buySellAlert: Alert[] = [];
  color: ThemePalette = 'primary';
  wallet: string = '';
  stocksBought: StocksBought[] = [];
  currentPrices: Map<string, any[]> = new Map();
  quantity: number = 0;
  sellQuantity = 0;
  alerts: Alert[] = [];
  displaySpinner = true;
  constructor(
    private homeService: HomeService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.homeService.getWallet().subscribe((data) => {
      this.wallet = data;
      this.displaySpinner = false;
    });
    this.homeService.stocksBought().subscribe((data) => {
      data = data.filter((stock) => stock.quantity > 0);
      this.stocksBought = data;
      if (data.length === 0) {
        this.alerts.push({
          type: 'warning',
          message: "Currently you don't have any stock in your portfolio.",
        });
        return;
      } else {
        data.forEach((stock) => {
          if (stock.quantity > 0) {
            this.homeService
              .quoteForPortfolio(stock.stock)
              .subscribe((data) => {
                this.currentPrices.set(stock.stock, [
                  parseFloat(data.c.toFixed(2)),
                  (data.c - stock.price).toFixed(2) === '-0.00'
                    ? '0.00'
                    : (data.c - stock.price).toFixed(2),
                  parseFloat((data.c * stock.quantity).toFixed(2)),
                ]);
              });
          }
        });
      }
    });
  }

  open1(content: any, stock: StocksBought): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-buy' });
    this.quantity = 0;
  }

  buyStock(
    stock: StocksBought,
    newAmount: number,
    newQuantity: number,
    avgPrice: number
  ) {
    console.log('New Quantity: ' + newQuantity);
    console.log('Avg Price: ' + avgPrice);
    this.homeService.updateWallet(newAmount).subscribe(() => {
      this.homeService
        .updateStock1(
          stock.stock,
          stock.stockDescription,
          newQuantity,
          avgPrice
        )
        .subscribe(() => {
          this.homeService.getWallet().subscribe((data) => {
            console.log('Wallet: ' + data);
            this.wallet = data;
            this.homeService.stocksBought().subscribe((data) => {
              console.log('Stocks Bought: ' + JSON.stringify(data));
              data = data.filter((stock) => stock.quantity > 0);
              this.stocksBought = data;
              data.forEach((stock) => {
                if (stock.quantity > 0) {
                  this.homeService
                    .quoteForPortfolio(stock.stock)
                    .subscribe((data) => {
                      this.currentPrices.set(stock.stock, [
                        parseFloat(data.c.toFixed(2)),
                        (data.c - stock.price).toFixed(2) === '-0.00'
                          ? '0.00'
                          : (data.c - stock.price).toFixed(2),
                        parseFloat((data.c * stock.quantity).toFixed(2)),
                      ]);
                    });
                }
              });
              this.buySellAlert.push({
                type: 'success',
                message: stock.stock + ' bought successfully.',
              });
              this.modalService.dismissAll();
            });
          });
        });
    });
    this.modalService.dismissAll();
  }

  open2(content: any, stock: StocksBought): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-sell' });
    this.sellQuantity = 0;
  }

  closeBuySellAlert(alert: Alert) {
    this.buySellAlert = [];
  }

  sellStock(stock: StocksBought, newAmount: number, newQuantity: number) {
    this.homeService.updateWallet(newAmount).subscribe(() => {
      this.homeService
        .updateStock1(
          stock.stock,
          stock.stockDescription,
          newQuantity,
          stock.price
        )
        .subscribe(() => {
          this.homeService.getWallet().subscribe((data) => {
            console.log('Wallet: ' + data);
            this.wallet = data;
            this.homeService.stocksBought().subscribe((data) => {
              console.log('Stocks Bought: ' + JSON.stringify(data));
              data = data.filter((stock) => stock.quantity > 0);
              this.stocksBought = data;
              if (data.length === 0) {
                this.alerts.push({
                  type: 'warning',
                  message:
                    "Currently you don't have any stock in your portfolio.",
                });
                return;
              } else {
                data.forEach((stock) => {
                  if (stock.quantity > 0) {
                    this.homeService
                      .quoteForPortfolio(stock.stock)
                      .subscribe((data) => {
                        this.currentPrices.set(stock.stock, [
                          parseFloat(data.c.toFixed(2)),
                          (data.c - stock.price).toFixed(2) === '-0.00'
                            ? '0.00'
                            : (data.c - stock.price).toFixed(2),
                          parseFloat((data.c * stock.quantity).toFixed(2)),
                        ]);
                      });
                  }
                });
              }
              this.modalService.dismissAll();
              this.buySellAlert.push({
                type: 'danger',
                message: stock.stock + ' sold successfully.',
              });
            });
          });
        });
        this.modalService.dismissAll();
    });
  }

  checkIfObjectEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  checkIfMapEmpty(map: Map<string, any[]>): boolean {
    return map.size === 0;
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  parseFloat(string: string): number {
    return parseFloat(string);
  }

  parseInt(string: string): number {
    return parseInt(string);
  }

  calculateBuyPrice(stock: StocksBought): number {
    return this.currentPrices.get(stock.stock)?.[0] * this.quantity;
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
}
