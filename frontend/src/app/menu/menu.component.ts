import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {CookieService} from 'ngx-cookie-service';
import {User} from "../models/user";
import {UserService} from "../user-service/user-service.component";
import {ActivatedRoute} from '@angular/router';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(public user: User, public cookie: CookieService, public userService: UserService, private route: ActivatedRoute, private translate: TranslateService) {
    this.cookie.get('lang') == 'en' ? this.translate.use('en') : this.translate.use('fr');
  }

  public validToken$: Observable<boolean>;

  /**
   * Récupération des informations de l'utilisateur via son token.
   */
  ngOnInit(): void {
    this.validToken$ = this.userService.validToken();
    this.validToken$.subscribe();
    this.userService.getUser().subscribe((user) => this.user = user);
  }

  /**
   * Use to change page language
   * @param lang fr ou en selon langue voulue
   */
  changeLanguage(lang): void {
    if(lang == 'en') {
      this.cookie.set('lang', 'en');
      this.translate.use('en');
    } else {
      this.cookie.set('lang', 'fr');
      this.translate.use('fr');
    }
  }

}
