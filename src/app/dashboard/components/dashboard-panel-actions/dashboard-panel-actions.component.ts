import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Sort } from 'src/app/models';

@Component({
  selector: 'app-dashboard-panel-actions',
  templateUrl: './dashboard-panel-actions.component.html',
  styleUrls: ['./dashboard-panel-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPanelActionsComponent {
  @Input() creator: boolean = false;
  @Input() sorts: Sort[] = [];
  @Output() createBoard = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() select = new EventEmitter<Sort>();

  onCreateBoard(): void {
    this.createBoard.emit();
  }

  onSearch(value: string): void {
    this.search.emit(value);
  }

  onSelect(change: MatSelectChange): void {
    this.select.emit(change.value);
  }

}
