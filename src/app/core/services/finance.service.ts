import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions, Jsonp } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';



import { Quote, WatchList, StockInfo } from '../interfaces/stock-info';
import { Observable } from "rxjs/Observable";
import { UtilService } from "app/core/services/util.service";
import { AuthService } from "app/core/services/auth.service";

@Injectable()
export class FinanceService {
  private googleFinUrl = 'http://finance.google.com/finance/info?JSONP_CALLBACK&q=';
  user: Observable<firebase.User>;
  items: FirebaseListObservable<any[]>;
  watchLists: FirebaseListObservable<WatchList[]>;
  msgVal: string = '';

  constructor(private jsonp: Jsonp, private util: UtilService, public afAuth: AngularFireAuth, 
  public af: AngularFireDatabase, public auth:AuthService) {
    this.user = this.afAuth.authState;
  }

  getWatchLists(): Array<WatchList> {
    let usrProfile = this.auth.getUserProfile();
    this.watchLists = this.af.list('/wls/'+usrProfile.user_id, { //usrProfile.userid
      query: {
        limitToLast: 50
      }
    });
    return this.getFromLocalStorage("WatchLists");
  }
  checkIfWatchlistExists(name: string):boolean {
     this.watchLists.find((ele) => { return (ele.name === name) }).subscribe(data=>{
        return (data.length > 0);
     });
     return false;
  }
  addWatchList(name: string): void {
    let wl: WatchList = new WatchList();
    wl.id = this.util.generateGUID();
    wl.name = name;
    this.watchLists.push(wl);
  }
  addTickerToWatchList(key:string,ticker: string, initialStake: number, watchlist: WatchList): void {
    if (ticker.length > 0) {
      let newStock = new StockInfo();
      newStock.t = ticker;
      newStock.stake = initialStake;
      watchlist.stocklist = watchlist.stocklist || [];
      watchlist.stocklist.push(newStock);
      this.updateWatchList(key,watchlist);
    }
  }
  updateWatchList(key:string,watchList: WatchList): void {
    this.watchLists.update(key,watchList);
  }
  deleteWatchList(key:string): void {
    this.watchLists.remove(key);
  }
  private saveInLocalStorage(collectionKey: string, object: Array<WatchList>) {
    localStorage.setItem(collectionKey, JSON.stringify(object));
  }
  private getFromLocalStorage(collectionKey: string): Array<WatchList> {
    return JSON.parse(localStorage.getItem(collectionKey)) || new Array<WatchList>();
  }
}