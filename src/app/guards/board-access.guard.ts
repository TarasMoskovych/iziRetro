import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class BoardAccessGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const boardId: string = route.params.id;

    return combineLatest([
      this.dashboardService.getBoard(boardId),
      this.authService.getCurrentUser(),
    ]).pipe(map(([board, user]) => {
      const resolve: boolean = board?.creator === user.email || !!user.sharedBoards?.includes(boardId);

      if (!resolve) {
        this.authService.navigateToDashboard();
      }
      return resolve;
    }));
  }
}
