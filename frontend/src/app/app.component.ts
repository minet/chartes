import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from "./user-service/user-service.component";
import {Observable, timer} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Chartes';
  validToken = this.userService.validToken();
  constructor(private userService: UserService, cookie: CookieService, translate: TranslateService) {
    if (navigator.language === 'fr' || navigator.language === 'fr-FR' || navigator.language === 'fr-fr' || navigator.language === 'fr-BE'
      || navigator.language === 'fr-be' || navigator.language === 'fr-LU' || navigator.language === 'fr-lu'
      || navigator.language === 'fr-CA' || navigator.language === 'fr-ca') {
      cookie.set('lang', 'fr');
    }
    else {
      cookie.set('lang', 'en');
    }
  }
  public validToken$: Observable<boolean>;
  ngOnInit(): void {
    timer(300).subscribe(x => {this.refreshToken(); });
    this.validToken$ = this.userService.validToken();
    this.validToken$.subscribe();

  }

  refreshToken(): void{
    this.validToken = this.userService.validToken();
  }

}
