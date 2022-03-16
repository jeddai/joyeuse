import { Component, OnInit } from '@angular/core';
import { MetricsService } from '../../services/metrics.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor(private metricsService: MetricsService) { }

  async ngOnInit(): Promise<void> {
    console.log(await this.metricsService.getMetrics());
    console.log(await this.metricsService.getMetrics('raid:lastWish'));
  }

}
