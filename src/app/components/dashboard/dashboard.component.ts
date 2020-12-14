import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { Board } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';
import { AddDashboardModalComponent } from '../add-dashboard-modal/add-dashboard-modal.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
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
     .subscribe((title: string) => this.addBoard({ title }));
  }

  private addBoard(board: Board): void {
    this.dashboardService.addBoard(board)
      .pipe(take(1))
      .subscribe();
    ;
  }
}
