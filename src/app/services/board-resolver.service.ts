import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Board } from '../models';

import { DashboardService } from './dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class BoardResolverService implements Resolve<Board>  {

  constructor(private dashboardService: DashboardService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Board> {
    return this.dashboardService.getBoard(route.params['id']).pipe(take(1));
  }
}
