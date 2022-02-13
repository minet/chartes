import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule} from "@angular/forms";
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HomeComponent } from './home/home.component';
import { CharteMinetComponent } from './charte-minet/charte-minet.component';
import { CharteHostingComponent } from './charte-hosting/charte-hosting.component';
import { AppRoutingModule } from './app-routing.module';
import { UserService } from './user-service/user-service.component';
import { User } from './models/user';
import { OAuthModule, OAuthStorage} from "angular-oauth2-oidc";
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';


export function storageFactory() : OAuthStorage {
  return localStorage;
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}


// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    HomeComponent,
    CharteMinetComponent,
    CharteHostingComponent
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['https://backchartes.minet.net/'],
        //allowedUrls: ['http://localhost:5332/'],
        sendAccessToken: true
      }
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [User, UserService, { provide: OAuthStorage, useFactory: storageFactory}],
  bootstrap: [AppComponent]
})
export class AppModule { }
