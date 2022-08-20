import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { CommandsComponent } from './pages/commands/commands.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { TermsOfUseComponent } from './pages/terms-of-use/terms-of-use.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  }, {
    path: 'privacy',
    component: PrivacyPolicyComponent
  }, {
    path: 'terms-of-use',
    component: TermsOfUseComponent
  }, {
    path: 'commands',
    component: CommandsComponent
  }, {
    path: 'stats',
    component: StatisticsComponent
  }, {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
