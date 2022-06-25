import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {
  }

  // IP du backend à utiliser.

  //public SERVER_URL = "http://localhost:5332/"
  public SERVER_URL = 'https://backchartes.minet.net/index.php';
  public adminDn = 'cn=adh6_admin,ou=groups,dc=minet,dc=net';
}
