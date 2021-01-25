import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {
  AddDashboardModalComponent,
  BoardViewComponent,
  BoardViewItemComponent,
  DashBoardsListComponent,
  DashboardPanelComponent,
  DashboardPanelActionsComponent,
  ShareComponent,
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
    ShareComponent,
    FortuneComponent,
  ],
  imports: [
    CommonModule,
    QRCodeModule,
    DashboardRoutingModule,
    SharedModule,
  ],
})
export class DashboardModule { }
