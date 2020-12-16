import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Board } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AddDashboardModalComponent } from '../add-dashboard-modal/add-dashboard-modal.component';

@Component({
  selector: 'app-dashboard-panel',
  templateUrl: './dashboard-panel.component.html',
  styleUrls: ['./dashboard-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPanelComponent implements OnInit {
  boards$: Observable<Board[]> = this.dashboardService.getMyBoards();
  sharedWithMe$: Observable<Board[]> = this.dashboardService.getBoardsSharedWithMe();

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private clipboard: Clipboard,
  ) { }

  ngOnInit(): void {
    this.shareBoard();
  }

  onOpenAddDashboardModal(): void {
    this.dialog.open(AddDashboardModalComponent).afterClosed()
     .pipe(take(1))
     .subscribe((title: string) => title?.length && this.addBoard({ title }));
  }

  onRemoveBoard(board: Board): void {
    this.dashboardService.removeBoard(board)
      .pipe(take(1))
      .subscribe();
  }

  onShareUrl(board: Board): void {
    this.clipboard.copy(`${window.location.origin}/dashboard?redirectUrl=${board.id}`);
    this.notificationService.showMessage('Copied to clipboard');
  }

  private addBoard(board: Board): void {
    this.dashboardService.addBoard(board)
      .pipe(take(1))
      .subscribe();
  }

  private shareBoard(): void {
    this.dashboardService.shareBoard()
      .pipe(take(1))
      .subscribe(() => this.router.navigate([], { queryParams: null }));
  }
}
