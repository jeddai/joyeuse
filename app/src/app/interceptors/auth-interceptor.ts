import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.authService.auth.value;
    let headers = req.headers;
    if (auth && !this.authService.expired(auth.expires_at)) {
      console.log('appending headers');
      headers = req.headers.append('Authorization', `Bearer ${auth.access_token}`);
    }
    return next.handle(req.clone({
      headers
    }));
  }
}