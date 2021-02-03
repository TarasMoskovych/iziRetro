import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BoardAccessGuard } from '../guards/board-access.guard';
import { BoardViewComponent, DashboardPanelComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: DashboardPanelComponent,
  },
  {
    path: ':id',
    component: BoardViewComponent,
    canActivate: [BoardAccessGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
