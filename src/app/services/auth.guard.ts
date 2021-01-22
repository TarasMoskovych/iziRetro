import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FirebaseUser } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.getCurrentUser()
      .pipe(map((user: FirebaseUser) => {
        !user?.emailVerified && this.router.navigate(['login'], {
          queryParams: route.queryParams,
        });
        return !!user?.emailVerified;
      }));
  }

}
