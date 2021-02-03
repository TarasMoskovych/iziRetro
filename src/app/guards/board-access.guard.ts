import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { Board, FirebaseUser, User } from '../models';
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
    let board: Board;

    return this.dashboardService.getBoard(boardId)
      .pipe(
        tap((b: Board) => board = b),
        switchMap(() => this.authService.getCurrentUser()),
        switchMap((fu: FirebaseUser) => this.authService.getUserByEmail(fu.email as string)),
        map((user: User) => {
          const resolve: boolean = board?.creator === user.email || !!user.sharedBoards?.includes(boardId);

          if (!resolve) {
            this.authService.navigateToDashboard();
          }
          return resolve;
        }),
      );
  }
}
