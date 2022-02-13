import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CharteMinetComponent} from './charte-minet/charte-minet.component'
import { CharteHostingComponent} from './charte-hosting/charte-hosting.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'charteminet', component: CharteMinetComponent},
  { path: 'chartehosting', component: CharteHostingComponent},
  { path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
