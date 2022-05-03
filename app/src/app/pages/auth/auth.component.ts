import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {

  componentDestroyed$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.fragment
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(async fragment => {
        const auth = fragment?.split('&')
          .reduce((prev, curr) => {
            const [k, v] = curr.split('=');
            prev[k] = v;
            if (k === 'expires_in') {
              const now = new Date().getTime();
              prev.expires_at = new Date(now + (parseInt(v) * 1000));
            }
            return prev;
          }, {} as any);
        this.authService.auth.next(auth);
        
        if (await firstValueFrom(this.authService.auth)) {
          this.router.navigateByUrl('/dashboard');
        }
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

}
