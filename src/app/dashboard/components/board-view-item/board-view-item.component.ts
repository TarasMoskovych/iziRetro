import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Post, Like } from 'src/app/models';
import { HEART } from '../../../../assets/icons';

@Component({
  selector: 'app-board-view-item',
  templateUrl: './board-view-item.component.html',
  styleUrls: ['./board-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewItemComponent {
  @Input() post: Post = {} as Post;
  @Input() color: string;
  @Input() edit = false;
  @Input() likes: Like[];

  @Output() save = new EventEmitter<Post>();
  @Output() remove = new EventEmitter<Post>();
  @Output() toggle = new EventEmitter<{ post: Post, edit: boolean }>();
  @Output() addRemoveLike = new EventEmitter<Post>();

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIconLiteral('heart', sanitizer.bypassSecurityTrustHtml(HEART));
  }

  onSave(value: string): void {
    if (value.length) {
      this.edit = false;
      this.save.emit({ ...this.post, value });
    }
  }

  onToggle(edit: boolean): void {
    this.toggle.emit({ post: this.post, edit });
  }

  onAddRemoveLike(event: MouseEvent): void {
    event.stopPropagation();
    this.addRemoveLike.emit(this.post);
  }

  onRemove(): void {
    this.remove.emit(this.post);
  }
}
