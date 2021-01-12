import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Post } from 'src/app/models';

@Component({
  selector: 'app-board-view-item',
  templateUrl: './board-view-item.component.html',
  styleUrls: ['./board-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewItemComponent {
  @Input() post: Post;
  @Input() color: string;
  @Input() edit = false
  @Output() save = new EventEmitter<Post>();
  @Output() toggle = new EventEmitter<{ post: Post, edit: boolean }>();

  onSave(e: MouseEvent, value: string): void {
    e.stopPropagation();

    if (value.length) {
      this.edit = false;
      this.save.emit({ ...this.post, value });
    }
  }

  onToggle(e: MouseEvent, edit: boolean): void {
    e.stopPropagation();
    this.toggle.emit({ post: this.post, edit });
  }

}
