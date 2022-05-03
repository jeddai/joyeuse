import { Component, OnInit } from '@angular/core';
import { APIGuild, APIUser } from '@discordjs/builders/node_modules/discord-api-types';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user?: APIUser;
  guilds?: APIGuild[];

  constructor(
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    const { user, guilds } = await this.authService.getUserData();
    this.user = user;
    this.guilds = guilds
  }

  iconUrl(guild: APIGuild): string {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`
  }

}
