import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { OrderModule } from 'ngx-order-pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {
  AddDashboardModalComponent,
  BoardViewComponent,
  BoardEditItemComponent,
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
    BoardEditItemComponent,
    BoardViewItemComponent,
    DashBoardsListComponent,
    DashboardPanelComponent,
    DashboardPanelActionsComponent,
    ShareComponent,
  ],
  imports: [
    CommonModule,
    OrderModule,
    QRCodeModule,
    DashboardRoutingModule,
    SharedModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule,
    MatSelectModule,
    MatListModule,
  ],
})
export class DashboardModule { }
