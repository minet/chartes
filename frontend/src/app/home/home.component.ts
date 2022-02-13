import { Component, OnInit } from '@angular/core';
import { UserService } from "../user-service/user-service.component";
import { AuthService} from "../auth-service/auth-service";
import { HttpClient } from "@angular/common/http";
import { Router} from "@angular/router";
import { User } from "../models/user";
import {interval, Observable, timer} from "rxjs";
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public response: string;
  public error: string;
  public countminet: string;
  public counthosting: string;
  constructor(private translate: TranslateService, private cookie: CookieService, private http: HttpClient, private router: Router, private user: User, public userService: UserService, private authService: AuthService) {
    if (cookie.get('lang') === 'fr'){
      translate.use('fr');
    }
  }
  public validToken$: Observable<boolean>;
  ngOnInit(): void {
      setTimeout(() => {  this.userService.getUser().subscribe((user) => this.user = user); // on laisse une seconde pour charger l'user avant de check si il a validé
        this.validToken$ = this.userService.validToken();
        this.validToken$.subscribe();
        if (this.userService.validToken()) {
          if (this.getUser().admin === false) {
            this.has_adh_signed();
            this.has_adh_signed_hosting()
          } else {
            this.count_minet();
            this.count_hosting();
          }
        }
      }, 1000);

  }

  getUser(): User {
      return this.user;
  }

  count_minet() {
    this.http.get(this.authService.SERVER_URL + "?countminet=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          this.countminet = this.response;
        }
      })
  }
  count_hosting() {
    this.http.get(this.authService.SERVER_URL + "?counthosting=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          this.counthosting = this.response;
        }
      })
  }

  has_adh_signed() {
    this.http.get(this.authService.SERVER_URL + "?getadhsigned=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          if (this.response == "signé") {
            this.getUser().signedminet = true;
          } else if (this.response == "non signé")
            this.getUser().signedminet = false;
        }
      })
  }
  has_adh_signed_hosting() {
    this.http.get(this.authService.SERVER_URL + "?getadhsignedhosting=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          if (this.response == "signé") {
            this.getUser().signedhosting = true;
          } else if (this.response == "non signé")
            this.getUser().signedhosting = false;
        }
      })
  }

}
