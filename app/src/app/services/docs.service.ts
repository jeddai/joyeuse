import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManifestItem } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocsService {

  _version = '1.0.0';
  versions = [
    '1.0.0'
  ];
  manifest: ManifestItem[] = [];

  constructor(private httpClient: HttpClient) {
    this.getManifest(this.version);
  }

  private async getManifest(version: string) {
    this.manifest = await firstValueFrom(this.httpClient.get<ManifestItem[]>(`/assets/docs/${version}/manifest.json`));
  }

  set version(version: string) {
    this._version = version;
    this.getManifest(version);
  }

  get version(): string {
    return this._version;
  }
}
