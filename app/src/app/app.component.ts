import { Component } from '@angular/core';
import { MetadataService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private metadataService: MetadataService) {
  }
}
