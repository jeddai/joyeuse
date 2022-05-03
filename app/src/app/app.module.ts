import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { CommandsComponent } from './pages/commands/commands.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { MetadataService, DocsService } from './services/';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { MetricsService } from './services/metrics.service';
import { ConfigService } from './services/config.service';
import { AuthComponent } from './pages/auth/auth.component';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DashboardComponent,
    HomeComponent,
    PrivacyPolicyComponent,
    CommandsComponent,
    PageNotFoundComponent,
    StatisticsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownModule.forRoot({
      loader: HttpClient
    }),
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    AuthService,
    ConfigService,
    MetadataService,
    MetricsService,
    DocsService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
