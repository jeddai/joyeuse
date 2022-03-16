import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';
import { DocsService } from '../../services';

@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommandsComponent implements OnInit, OnDestroy {

  version = '1.0.0';
  doc = 'getting-started.md';
  error?: string = undefined;
  private $componentDestroyed = new Subject<void>();

  constructor(private route: ActivatedRoute, private router: Router, public docsService: DocsService) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.$componentDestroyed),
      tap(params => {
        const { version, path } = params;
        if (version) this.version = version;
        if (path) this.doc = path;
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.$componentDestroyed.next();
  }

  onLoad(event: string): void {
    console.log(event);
    this.error = undefined;
  }

  onError(event: any): void {
    let message = event.message;
    console.error(message);
    this.error = message;
  }

  async changeDocPath(path: string) {
    this.error = undefined;
    await this.router.navigateByUrl(`/commands?version=${this.version}&path=${path}`);
  }

  get docPath(): string {
    return `/assets/docs/${this.version}/${this.doc}`;
  }
}

