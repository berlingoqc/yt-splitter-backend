import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextService } from './context.service';


export function getHeaderAuth(password: string) {
  return {
          Authorization: 'Basic ' + btoa('user:'+password)
        }
}

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

  constructor(
    private context: ContextService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(this.context.context) {
      request = request.clone({
        setHeaders: getHeaderAuth(this.context.context.password),
      })
    }
    return next.handle(request);
  }
}
