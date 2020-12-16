import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {
  AddDashboardModalComponent,
  BoardViewComponent,
  DashBoardsListComponent,
  DashboardPanelComponent,
} from './components';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AddDashboardModalComponent,
    BoardViewComponent,
    DashBoardsListComponent,
    DashboardPanelComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
  ],
})
export class DashboardModule { }
