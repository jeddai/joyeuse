import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Metadata } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  metadata?: Metadata

  constructor(private httpClient: HttpClient) {
    this.getMetadata().catch(console.error);
  }

  async getMetadata() {
    this.metadata = await firstValueFrom(this.httpClient.get<Metadata>('/api/metadata'));
  }
}
