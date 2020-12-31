import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContextService } from './context.service';

@Injectable({
  providedIn: 'root'
})
export class ContextGuard implements CanActivate {

  constructor(private contextService: ContextService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const canAccess = !(!this.contextService.context);
    if(!canAccess) {
      this.router.navigate(['/','context']);
    }
    return canAccess;
  }

}
