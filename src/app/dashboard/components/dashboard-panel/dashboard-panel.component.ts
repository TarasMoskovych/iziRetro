import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Board, boardSorts, Sort } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';
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
  searchBoards$ = new BehaviorSubject<string>('');
  searchSharedWithMe$ = new BehaviorSubject<string>('');
  sortBoards$ = new BehaviorSubject<Sort>(boardSorts[1]);
  sortSharedWithMe$ = new BehaviorSubject<Sort>(boardSorts[1]);
  sorts: Sort[] = boardSorts;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.shareBoard();
  }

  onOpenAddDashboardModal(): void {
    this.dialog.open(AddDashboardModalComponent).afterClosed()
     .pipe(take(1))
     .subscribe((title: string) => title?.length && this.addBoard({ title, completed: false }));
  }

  onRemoveBoard(board: Board): void {
    this.dashboardService.removeBoard(board.id as string)
      .pipe(take(1))
      .subscribe();
  }

  onShareUrl(board: Board): void {
    this.dashboardService.shareUrl(board);
  }

  onFreeze(board: Board): void {
    this.dashboardService.editBoard({ ...board, completed: !board.completed })
      .pipe(take(1))
      .subscribe();
  }

  onBoardsSearch(value: string, myBoards?: boolean): void {
    this[myBoards ? 'searchBoards$' : 'searchSharedWithMe$'].next(value);
  }

  onBoardsSelect(value: Sort, myBoards?: boolean): void {
    this[myBoards ? 'sortBoards$' : 'sortSharedWithMe$'].next(value);
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
