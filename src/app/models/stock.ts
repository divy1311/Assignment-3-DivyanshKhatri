import { News } from "./news";
import { Sentiments } from "./sentiments";

export interface Stock {
  country: string;
  currency: string;
  exchange: string;
  name: string;
  ticker: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
  phone: string;
  weburl: string;
  finnhubIndustry: string;
//   peers: string[];
//   news: News[];
//   sentiments: Sentiments[];
}
