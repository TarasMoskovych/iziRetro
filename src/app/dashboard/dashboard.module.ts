import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {
  AddDashboardModalComponent,
  BoardViewComponent,
  BoardViewItemComponent,
  DashBoardsListComponent,
  DashboardPanelComponent,
  DashboardPanelActionsComponent,
} from './components';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AddDashboardModalComponent,
    BoardViewComponent,
    BoardViewItemComponent,
    DashBoardsListComponent,
    DashboardPanelComponent,
    DashboardPanelActionsComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
  ],
})
export class DashboardModule { }
