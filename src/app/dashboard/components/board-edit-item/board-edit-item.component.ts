import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-board-edit-item',
  templateUrl: './board-edit-item.component.html',
  styleUrls: ['./board-edit-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardEditItemComponent {
  @Input() value: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  onClose(e: MouseEvent): void {
    e.stopPropagation();
    this.close.emit();
  }

  onRemove(e: MouseEvent): void {
    e.stopPropagation();
    this.remove.emit();
  }

  onSave(e: MouseEvent, value: string): void {
    e.stopPropagation();
    this.save.emit(value);
  }
}
