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

    /**
     * Fonction au rechargement du module. Permet de recharger les informations de l'utilisateur et le compte de chartes signées.
     */
  ngOnInit(): void {
      setTimeout(() => {  this.userService.getUser().subscribe((user) => this.user = user); // on laisse une seconde pour charger l'user avant de check si il a validé
        this.validToken$ = this.userService.validToken();
        this.validToken$.subscribe();
        if (this.userService.validToken()) {

          // Pas besoin de recharger les infos de signature de charte d'un admin
          if (this.getUser().admin === false) {
            this.has_adh_signed();
            this.has_adh_signed_hosting()
          } else {
            // Pas besoin de recharger les infos du compte de chartes quand on est non admin
            this.count_minet();
            this.count_hosting();
          }
        }
      }, 1000);

  }

    /**
     * Permet de renvoyer l'objet user.
     * @return : user
     */
  getUser(): User {
      return this.user;
  }

    /**
     * Fonction permettant de renvoyer le compte du nombre de chartes de fonctionnement réseau signées.
     * @return met countminet à la bonne valeur, sinon erreur.
     */
  count_minet() {

    // Appel au backend pour obtenir le nombre de chartes signées.
    this.http.get(this.authService.SERVER_URL + "?countminet=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          // si tout va bien on met la variable du home countminet à la bonne valeur.
          this.countminet = this.response;
        }
      })
  }

    /**
     * Fonction permettant de renvoyer le compte du nombre de chartes d'utilisation d'hosting.
     * @return met counthosting à la bonne valeur, sinon erreur.
     */
  count_hosting() {

    // Appel au backend pour obtenir le nombre de chartes signées.
    this.http.get(this.authService.SERVER_URL + "?counthosting=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          // si tout va bien on met la variable du home countminet à la bonne valeur.
          this.counthosting = this.response;
        }
      })
  }

    /**
     * Permet de vérifier si on a signé la charte MiNET (en tant qu'adhérent)
     * @return : met la variable user signedminet à la bonne valeur (true si oui, false si non)
     */
  has_adh_signed() {

    // Appel au backend pour savoir si on a signé.
    this.http.get(this.authService.SERVER_URL + "?getadhsigned=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          if (this.response == "signé") {
            // On met la variable user signedhosting à la bonne valeur.
            this.getUser().signedminet = true;
          } else if (this.response == "non signé")
            this.getUser().signedminet = false;
        }
      })
  }

    /**
     * Permet de vérifier si on a signé la charte Hosting (en tant qu'adhérent)
     * @return : met la variable user signedhosting à la bonne valeur (true si oui, false si non)
     */
  has_adh_signed_hosting() {

    // Appel au backend pour savoir si on a signé.
    this.http.get(this.authService.SERVER_URL + "?getadhsignedhosting=1", {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error)
          window.alert(this.error);
        else {
          if (this.response == "signé") {
            // On met la variable user signedhosting à la bonne valeur.
            this.getUser().signedhosting = true;
          } else if (this.response == "non signé")
            this.getUser().signedhosting = false;
        }
      })
  }

}
