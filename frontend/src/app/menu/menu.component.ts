import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {User} from "../models/user";
import {UserService} from "../user-service/user-service.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(public user: User, public userService: UserService) { }

  public validToken$: Observable<boolean>;
  ngOnInit(): void {
    this.validToken$ = this.userService.validToken();
    this.validToken$.subscribe();
    this.userService.getUser().subscribe((user) => this.user = user);
  }

}
