import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { take } from 'rxjs/operators';

import { Board } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashBoardsListComponent implements OnInit {
  @Input() boards: Board[] | null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
  }

  onRemove(board: Board): void {
    this.dashboardService.removeBoard(board)
      .pipe(take(1))
      .subscribe();
  }

}
