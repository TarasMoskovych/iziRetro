import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Post, Like, FirebaseUser } from 'src/app/models';
import { HEART, HEART_OUTLINED } from '../../../../assets/icons';

@Component({
  selector: 'app-board-view-item',
  templateUrl: './board-view-item.component.html',
  styleUrls: ['./board-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewItemComponent implements OnChanges{
  @Input() post: Post = {} as Post;
  @Input() color: string;
  @Input() edit = false; // toggle edit/view
  @Input() editable: boolean; // only for styling
  @Input() likes: Like[];
  @Input() user: FirebaseUser;
  isLiked: boolean;

  @Output() save = new EventEmitter<Post>();
  @Output() remove = new EventEmitter<Post>();
  @Output() toggle = new EventEmitter<{ post: Post, edit: boolean }>();
  @Output() addRemoveLike = new EventEmitter<Post>();

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIconLiteral('heart', sanitizer.bypassSecurityTrustHtml(HEART));
    iconRegistry.addSvgIconLiteral('heart-outlined', sanitizer.bypassSecurityTrustHtml(HEART_OUTLINED));
  }

  ngOnChanges() {
    this.isLiked = this.likes?.filter((like: Like) => like.user.email === this.user.email).length > 0;
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
