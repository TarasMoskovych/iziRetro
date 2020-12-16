import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Board } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';
import { AddDashboardModalComponent } from '../add-dashboard-modal/add-dashboard-modal.component';

@Component({
  selector: 'app-dashboard-panel',
  templateUrl: './dashboard-panel.component.html',
  styleUrls: ['./dashboard-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPanelComponent implements OnInit {
  boards$: Observable<Board[]> = this.dashboardService.getBoards();

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  onOpenAddDashboardModal(): void {
    this.dialog.open(AddDashboardModalComponent).afterClosed()
     .pipe(take(1))
     .subscribe((title: string) => title?.length && this.addBoard({ title }));
  }

  private addBoard(board: Board): void {
    this.dashboardService.addBoard(board)
      .pipe(take(1))
      .subscribe();
  }
}
