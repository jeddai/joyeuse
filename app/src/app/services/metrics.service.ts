import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Metrics } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor(private httpClient: HttpClient) { }

  async getMetrics(activity?: string, guild?: string): Promise<Metrics> {
    let path = `/api/metadata/metrics`;
    if (activity) path += `?activity=${activity}`;
    if (guild) path += `${activity ? '&' : '?'}guild=${guild}`;
    return await firstValueFrom(this.httpClient.get<Metrics>(path));
  }
}
