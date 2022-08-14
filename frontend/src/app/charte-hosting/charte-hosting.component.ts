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
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-charte-hosting',
  templateUrl: './charte-hosting.component.html',
  styleUrls: ['./charte-hosting.component.css']
})
export class CharteHostingComponent implements OnInit {
  private stepper: Stepper;
  public response: string;
  public status: number;
  public countminet: BigInteger;
  public counthosting: BigInteger;
  public generatesuccess = false;
  public signsuccess = false; // pour faire apparaître l'encadré de succès de validation
  constructor(private http: HttpClient, private user: User, public userService: UserService, private cookie: CookieService, public authService: AuthService,  private route: ActivatedRoute) {}

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
        if (this.userService.validToken && this.user.name && !this.getUser().admin && !this.getUser().nopermission) { // si le gars est connecté / existe
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
    this.http.get(this.authService.SERVER_URL + "?getadhsignedhosting=1", {observe: 'response'})
      .subscribe(rep => {
        this.status = rep.body['status'];;
        this.response = rep.body['message'];

        // si une erreur apparaît on l'affiche.
        if (this.status != 200)
          window.alert(this.response);
        else {
          if (this.response == "signé") {
            this.getUser().signedhosting = true;

            // si l'adhérent a en effet signé on récupère la date de signature.
            this.get_adh_date_signed();
          } else if (this.response == "non signé")
            this.getUser().signedhosting = false;
        }
      })
  }

    /**
     * Fonction permettant de récupérer la date de signature de la charte.
     * @return met datesignedhosting à la valeur de la date de signature le cas échéant.
     */
  get_adh_date_signed() {
    if(this.getUser().signedhosting == true) {
      // Appel backend pour récupérer la date de signature
      this.http.get(this.authService.SERVER_URL + "?getsigneddatehosting=1", {observe: 'response'})
        .subscribe(rep => {
          this.status = rep.body['status'];;
          this.response = rep.body['message'];

          // si une erreur est présente on l'affiche.
          if (this.status != 200)
            window.alert(this.response);
          else {
            // si pas d'erreur on met la variable user de date de signature à la bonne valeur.
            this.getUser().datesignedhosting = this.response;
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
    this.http.get(this.authService.SERVER_URL + "?setadhsignedhosting=" + (this.getUser().admin && pseudo ? pseudo : "1") + "&language=" + this.cookie.get('lang'), {observe: 'response'})
      .subscribe(rep => {
        this.status = rep.body['status'];;
        this.response = rep.body['message'];

        // si une erreur apparaît on l'affiche.
        if (this.status != 200) {
          window.alert(this.response);
        } else {
          if (!this.getUser().admin) // on ne veut pas rafraichir la signature pour un admin il a pas de compte dans fdpsql
            setTimeout(() => {
              this.has_adh_signed();
            }, 1000); // on refraichit la signature de l'adhérent
          window.scroll(0, 0); // on remonte en haut
          this.signsuccess = true; // pour afficher l'encadré de succès

        }
      })
  }
}
