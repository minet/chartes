import {Component, OnInit, ViewChild} from '@angular/core';
import { UserService } from "../user-service/user-service.component";
import { AuthService} from "../auth-service/auth-service";
import { HttpClient } from "@angular/common/http";
import { Router} from "@angular/router";
import { User } from "../models/user";
import {interval, Observable, timer} from "rxjs";
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import {Chart, ChartConfiguration, ChartOptions, ChartType} from "chart.js";
import { BaseChartDirective } from 'ng2-charts';
import {default as Annotation} from 'chartjs-plugin-annotation';
import {waitForAsync} from "@angular/core/testing";
import {timeout} from "rxjs/operators";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public response: string;
  public error: string;
  public countminet: Number;
  public counthosting: Number;
  public validToken$: Observable<boolean>;
  private countminetarray: []; // pour contenir les valeurs des cotisations par jour et la date
  private counthostingarray: []; // pour contenir les valeurs des cotisations par jour et la date
  private date: Date;
  public currentDate = new Date(); // date actuelle pour les comparaisons
  public beginYear = 2021; // on démarre à la première année où on a lancé chartes, soit 2021
  public startYearMonth = 6; // on démarre le compte au mois de JUILLET ( = 6 )
  private count: number;
  private i: number;
  private j: number;

  constructor(private translate: TranslateService, private cookie: CookieService, private http: HttpClient, private router: Router, private user: User, public userService: UserService, private authService: AuthService) {
      Chart.register(Annotation)
      if (cookie.get('lang') === 'fr'){
      translate.use('fr');
    }
  }
    title = 'Signatures des chartes';

    /**
     * Objet correspondant à la courbe des signatures des chartes. Les champs data et labels seront remplis au fur et à mesure de la récupération des infos de la DB.
     */
    public lineChartData: { datasets: { tension: number; borderColor: string; backgroundColor: string; data: any[]; label: string; fill: boolean }[]; labels: string[] } = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Chartes MiNET',
                fill: true,
                tension: 0.5,
                borderColor: 'black',
                backgroundColor: 'rgba(255,0,0,0.3)'
            },
            {
                data: [],
                label: 'Chartes Hosting',
                fill: true,
                tension: 0.5,
                borderColor: 'black',
                backgroundColor: 'rgba(135,206,250,0.3)'
            }
        ]
    };

    /**
     * Options possibles pour la courbe. Ici on fait en sorte qu'on puisse redimensionner la courbe comme on veut via du css.
     */
    public lineChartOptions: ChartOptions<'line'> = {
        responsive: false,
        maintainAspectRatio: false
    };
    public lineChartLegend = true;

    /**
     * Permet de gérer les data et labels via des push et de reload la courbe par la suite.
     */
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    /**
     * Fonction au rechargement du module. Permet de recharger les informations de l'utilisateur et le compte de chartes signées.
     */
    ngOnInit(): void {
        setTimeout(() => {
            this.userService.getUser().subscribe((user) => this.user = user); // on laisse une seconde pour charger l'user avant de check si il a validé
            this.validToken$ = this.userService.validToken();
            this.validToken$.subscribe();
            if (this.userService.validToken()) {
                // Pas besoin de recharger les infos de signature de charte d'un admin
                if (this.getUser().admin === false) {
                    this.has_adh_signed();
                    this.has_adh_signed_hosting()
                } else {
                    // Pas besoin de recharger les infos du compte de chartes quand on est non admin
                    this.get_count_from_api();
                    this.get_count_from_api(true);
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
     * Permet de renvoyer l'array counthosting
     * @return : array
     */
  getCountHostingArray(): any {
      return this.counthostingarray;
  }

    /**
     * Permet de renvoyer l'array countminetarray
     * @return : array
     */
    getCountMinetArray(): any {
        return this.countminetarray;
    }

    /**
     * Fonction permettant de récupérer le tableau complet des valeurs de signature avec les dates
     * @return renvoie un array, sinon erreur.
     */
    get_count_from_api(hosting = false) {

        // Appel au backend pour obtenir le nombre de chartes signées.
        this.http.get(this.authService.SERVER_URL + (hosting == true ? "?counthosting=1" : "?countminet=1"), {observe: 'response'})
            .subscribe(rep => {
                    this.error = rep.body['error'];
                    this.response = rep.body['response'];
                    if (this.error)
                        window.alert(this.error);
                    else {
                        // si tout va bien on met la variable du home countminet à la bonne valeur.
                        if(hosting == false) {
                            this.countminetarray = rep.body['response'];

                            if (this.currentDate.getMonth() >= this.startYearMonth) // si on démarre la nouvelle année scolaire on lit à partir du mois de départ jusqu'au mois de la prochaine année
                                this.countminet = this.count_date(this.currentDate.getFullYear(), this.startYearMonth, this.countminetarray, true);
                            else // si on est encore sur une année en cours on lit du mois de début (peut être année précédente) jusqu'à son pote de l'année qui suit
                                this.countminet = this.count_date(this.currentDate.getFullYear() - 1, this.startYearMonth, this.countminetarray, true);
                        } else {
                            this.counthostingarray = rep.body['response'];

                            if (this.currentDate.getMonth() >= this.startYearMonth)
                                this.counthosting = this.count_date(this.currentDate.getFullYear(), this.startYearMonth, this.counthostingarray, true);
                            else
                                this.counthosting = this.count_date(this.currentDate.getFullYear() - 1, this.startYearMonth, this.counthostingarray, true);
                        }
                        if(this.lineChartData.labels.length == 0 && this.countminetarray.length > 0 && this.counthostingarray.length > 0)
                            this.fill_graph(); // on en profite pour rempli le graph si c'est pas déjà fait (si on a toutes les données)
                    }
                }
            )
    }

    /**
     * Remplit la courbe avec les données récoltées
     */
    fill_graph() {
        for(this.i = 2; this.i > 0; this.i--) { // on lit jusqu'en 2021, pas besoin de +
            for(this.j = (this.i == 2 ? this.currentDate.getMonth() - 2 : 1); this.j < 13; this.j++) { // volontairement laissé 12 mois + 2 pour avoir une plus belle lisibilité des données
                this.lineChartData.labels.push(this.currentDate.getFullYear()+1-this.i + "-" + this.j);
                this.lineChartData.datasets[0].data.push(this.count_date(this.currentDate.getFullYear()+1-this.i, this.j - 1, this.countminetarray))
                this.lineChartData.datasets[1].data.push(this.count_date(this.currentDate.getFullYear()+1-this.i, this.j - 1, this.counthostingarray))
                if(this.j == this.currentDate.getMonth()+1 && this.i == 1) // si on dépasse le mois actuel dans l'année en cours on sort de la boucle
                    break;
            }
        }
        this.chart?.update(); // update de la courbe (important)
    }

    /**
     * Fonction permettant de renvoyer le compte du nombre de chartes de fonctionnement réseau signées.
     * @return met countminet à la bonne valeur, sinon erreur.
     */
  count_date(year?: number, month?: number, dataset=[], startFromMonth?: boolean): Number {
        this.count = 0;
        dataset.forEach(x => {
        this.date = new Date(x[0]);
        if((year && month) && (this.date.getFullYear() == year && this.date.getMonth() == month) && !startFromMonth)
            this.count += Number(x[1]);
        else if((year && month) && (this.date.getFullYear() == year && this.date.getMonth() >= month || this.date.getFullYear() == year+1 && this.date.getMonth() < month) && startFromMonth)
            this.count += Number(x[1]);
        else if (!year && !month)
            this.count += Number(x[1]);
    });
    return this.count;
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

    /**
     * utilisée pour les boucles for dans le html
     * @param i nombre d'incrémentations à faire
     */
  counter(i: number) {
      return new Array(i);
  }

}
