import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../../services';
import { MetricsService } from '../../services/metrics.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  activities?: number;

  constructor(
    public metadataService: MetadataService,
    private metricsService: MetricsService
  ) { }

  async ngOnInit(): Promise<void> {
    this.activities = (await this.metricsService.getMetrics())['total'] as number;
  }

}
