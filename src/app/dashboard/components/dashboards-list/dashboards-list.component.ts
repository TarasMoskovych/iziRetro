import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { Board } from 'src/app/models';

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashBoardsListComponent {
  @Input() boards: Board[] = [];
  @Input() creator: boolean = false;
  @Input() searchQuery: string | null = '';
  @Input() sort: string | null;
  @Output() removeBoard = new EventEmitter<Board>();
  @Output() shareUrl = new EventEmitter<Board>();

  onShareUrl(board: Board): void {
    this.shareUrl.emit(board);
  }

  onRemove(board: Board): void {
    this.removeBoard.emit(board);
  }
}
