import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DiscordAuth } from '../models';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIGuild, APIUser } from '@discordjs/builders/node_modules/discord-api-types';

const AUTH_KEY = 'joyeuse-discord-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auth = new BehaviorSubject<DiscordAuth | undefined>(JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null') ?? undefined);

  constructor(private http: HttpClient) {
    this.auth.subscribe(auth => {
      if (auth) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    });
  }

  logout(): void {
    this.auth.next(undefined);
  }

  async token(): Promise<string | undefined> {
      return (await firstValueFrom(this.auth))?.access_token;
  }

  expired(expires_at: Date | undefined): boolean {
    if (!expires_at) {
      return true;
    }
    if (!expires_at.getTime) {
      expires_at = new Date(expires_at);
    }
    return new Date().getTime() - expires_at.getTime() > 0;
  }

  async getUserData(): Promise<{
    user: APIUser,
    guilds: APIGuild[]
  }> {
    const user = await firstValueFrom(this.http.get<APIUser>('/api/auth/user'));
    const guilds = await firstValueFrom(this.http.get<APIGuild[]>('/api/auth/guilds'));
    return {
      user,
      guilds
    }
  }
}
