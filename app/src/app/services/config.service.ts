import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  config?: Config

  constructor(private httpClient: HttpClient) {
    this.getConfig().catch(console.error);
  }

  async getConfig() {
    this.config = await firstValueFrom(this.httpClient.get<Config>('/api/config'));
  }
}
