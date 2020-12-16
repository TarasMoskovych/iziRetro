import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BoardResolverService } from '../services/board-resolver.service';
import { BoardViewComponent, DashboardPanelComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: DashboardPanelComponent,
  },
  {
    path: ':id',
    component: BoardViewComponent,
    resolve: {
      board: BoardResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
