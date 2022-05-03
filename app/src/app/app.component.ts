import { Component, OnInit } from '@angular/core';
import { MetadataService } from './services';
import { AuthService } from './services/auth.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  expired: boolean = true;

  constructor(
    public authService: AuthService,
    private configService: ConfigService,
    private metadataService: MetadataService
  ) {}

  ngOnInit() {
    this.authService.auth.subscribe(auth => {
      this.expired = this.authService.expired(auth?.expires_at);
    });
  }

  get loginUrl(): string {
    if (this.configService.config?.clientId) {
      const uri = encodeURIComponent(this.configService.config?.redirect_uri);
      return `https://discord.com/api/oauth2/authorize?response_type=token&client_id=${this.configService.config?.clientId}&state=15773059ghq9183habn&scope=identify%20guilds&redirect_uri=${uri}`;
    } else {
      return '';
    }
  }

  get inviteUrl(): string {
    if (this.configService.config?.clientId) {
      return `https://discord.com/oauth2/authorize?client_id=${this.configService.config?.clientId}&permissions=10737536064&scope=bot%20applications.commands`;
    } else {
      return '';
    }
  }
}
