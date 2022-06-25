import { Component, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {User} from "../models/user";
import {CookieService} from 'ngx-cookie-service';
import {UserService} from "../user-service/user-service.component";
import {AuthService} from "../auth-service/auth-service";
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {interval, Observable} from "rxjs";

@Component({
  selector: 'app-charte-minet',
  templateUrl: './charte-minet.component.html',
  styleUrls: ['./charte-minet.component.css']
})
export class CharteMinetComponent implements OnInit {
  private stepper: Stepper;
  public response: string;
  public error: string;
  public countminet: BigInteger;
  public counthosting: BigInteger;
  public generatesuccess = false;
  public signsuccess = false; // pour faire apparaître l'encadré de succès de validation
  constructor(public cookie: CookieService, private http: HttpClient, private router: Router, private user: User, public userService: UserService, public authService: AuthService, private translate: TranslateService) {
    if (cookie.get('lang') === 'fr'){
      translate.use('fr');
    }
  }

    /**
     * Permet de récupérer les infos de l'utilisateur.
     */
  getUser(): User {
    return this.user;
  }

  public validToken$: Observable<boolean>;

    /**
     * Fonction récupérant le token cookie de l'utilisateur et les informations de celui-ci.
     */
  ngOnInit(): void {
    this.validToken$ = this.userService.validToken();

    // on souscrit au token d'infos de l'utilisateur.
    this.validToken$.subscribe();

    // récupération toutes les secondes des infos de l'utilisateur, notamment de si il a signé la charte.
    setTimeout(() => {  this.userService.getUser().subscribe((user) => this.user = user) // on laisse une seconde pour charger l'user avant de check si il a validé
      if (this.userService.validToken && !this.getUser().admin && !this.getUser().nopermission) { // si le gars est connecté / existe

        // récupération des infos liées à la signature de la charte par l'adhérent.
        this.has_adh_signed();
      }
    }, 1000);
  }

    /**
     * Fonction permettant de savoir si un adhérent a signé.
     * @return met signedhosting (variable user) à true si signé, sinon false.
     */
  has_adh_signed() {

  // appel au backend pour vérifier si l'adhérent a signé.
  this.http.get(this.authService.SERVER_URL + "?getadhsigned=1", {observe: 'response'})
    .subscribe(rep => {
      this.error = rep.body['error'];
      this.response = rep.body['response'];

      // si une erreur apparaît on l'affiche.
      if (this.error)
        window.alert(this.error);
      else {
        if (this.response == "signé") {
          this.getUser().signedminet = true;

          // si l'adhérent a en effet signé on récupère la date de signature.
          this.get_adh_date_signed();
        } else if (this.response == "non signé")
          this.getUser().signedminet = false;
      }
    })
  }

    /**
     * Fonction permettant de récupérr la date de signature de la charte.
     * @return met datesignedhosting à la valeur de la date de signature le cas échéant.
     */
  get_adh_date_signed() {
    if(this.getUser().signedminet == true) {

      // Appel backend pour obtenir la date de signature
      this.http.get(this.authService.SERVER_URL + "?getsigneddate=1", {observe: 'response'})
        .subscribe(rep => {
          this.error = rep.body['error'];
          this.response = rep.body['response'];

          // si une erreur est présente on l'affiche.
          if (this.error)
            window.alert(this.error);
          else {
              // si pas d'erreur on met la variable user de date de signature à la bonne valeur.
              this.getUser().datesignedminet = this.response;
          }
        })
    }
  }

    /**
     * Permet de signer soi-même sa charte ou la faire signer si on est admin.
     * @param pseudo pseudo de l'adhérent, vide si c'est lui même qui signe.
     */
  set_adh_signed(pseudo = "") {

    // appel au backend pour signer.
    this.http.get(this.authService.SERVER_URL + "?setadhsigned=" + (this.getUser().admin && pseudo ? pseudo : "1") + "&language=" + this.cookie.get('lang'), {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];

        // si une erreur apparaît on l'affiche.
        if (this.error) {
          window.alert(this.error);
        } else {
          if(!this.getUser().admin) // on ne veut pas rafraichir la signature pour un admin il a pas de compte dans fdpsql
            setTimeout( () => { this.has_adh_signed(); }, 1000 ); // on refraichit la signature de l'adhérent
          window.scroll(0, 0); // on remonte en haut
          this.signsuccess = true; // pour afficher l'encadré de succès

        }
      })
  }

    /**
     * Fonction non utilisée. Elle aura pour but de régénérer la charte
     * @param pseudo pseudo de l'adhérent si on est admin, vide sinon.
     */
  generate_charte(pseudo = "") {

      // Appel backend pour regénérer la charte
    this.http.get(this.authService.SERVER_URL + "?regeneratecharte=" + (this.getUser().admin && pseudo ? pseudo : "1") + "&language=" + this.cookie.get('lang'), {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
        if (this.error) {
          window.alert(this.error);
        } else {
          window.scroll(0, 0); // on remonte en haut
          this.generatesuccess = true; // pour afficher l'encadré de succès
        }
      } )
  }
}
