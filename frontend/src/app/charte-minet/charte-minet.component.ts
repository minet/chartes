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

  getUser(): User {
    return this.user;
  }
  public validToken$: Observable<boolean>;
  ngOnInit(): void {
    this.validToken$ = this.userService.validToken();
    this.validToken$.subscribe();
    setTimeout(() => {  this.userService.getUser().subscribe((user) => this.user = user) // on laisse une seconde pour charger l'user avant de check si il a validé
      if (this.userService.validToken && !this.getUser().admin && !this.getUser().nopermission) { // si le gars est connecté / existe
        this.has_adh_signed();
      }
    }, 1000);
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
          this.get_adh_date_signed();
        } else if (this.response == "non signé")
          this.getUser().signedminet = false;
      }
    })
  }

  get_adh_date_signed() {
    if(this.getUser().signedminet == true) {
      this.http.get(this.authService.SERVER_URL + "?getsigneddate=1", {observe: 'response'})
        .subscribe(rep => {
          this.error = rep.body['error'];
          this.response = rep.body['response'];
          if (this.error)
            window.alert(this.error);
          else {
              this.getUser().datesignedminet = this.response;
          }
        })
    }
  }
  set_adh_signed(pseudo = "") {
    this.http.get(this.authService.SERVER_URL + "?setadhsigned=" + (this.getUser().admin && pseudo ? pseudo : "1") + "&language=" + this.cookie.get('lang'), {observe: 'response'})
      .subscribe(rep => {
        this.error = rep.body['error'];
        this.response = rep.body['response'];
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

  generate_charte(pseudo = "") {
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

  onSubmit() {
    return false;
  }

}
