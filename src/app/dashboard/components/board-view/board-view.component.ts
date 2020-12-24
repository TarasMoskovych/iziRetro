import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Board, Column, Post } from 'src/app/models';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewComponent implements OnInit {
  columns$: Observable<Column[]>;
  posts$: Observable<Post[]>;
  search$ = new BehaviorSubject<string>('');
  sort$ = new BehaviorSubject<string>('date');

  board: Board;
  verticalLayout = false;
  addNewPostToggleMap: { [key: string]: boolean } = {};
  editPostToggleMap: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.board = this.route.snapshot.data['board'];
    this.board ? this.getData() : this.router.navigateByUrl('dashboard');
  }

  onLayoutChange(e: MatButtonToggleChange): void {
    this.verticalLayout = e.value === 'VERTICAL';
  }

  toggle(columnTitle: string, cond: boolean): void {
    this.addNewPostToggleMap[columnTitle] = cond;
  }

  onSaveNewItem(value: string, column: Column): void {
    this.addNewPostToggleMap[column.title] = false;
    this.postService.addPost({ value, columnPosition: column.position, boardId: this.board.id as string })
      .pipe(take(1))
      .subscribe();
  }

  onToggleItem(e: { post: Post, edit: boolean }): void {
    this.editPostToggleMap[e.post.id as string] = e.edit;
  }

  onEditItem(post: Post): void {
    this.editPostToggleMap[post.id as string] = false;
    this.postService.editPost(post)
      .pipe(take(1))
      .subscribe();
  }

  onSearch(value: string): void {
    this.search$.next(value);
  }

  onSort(value: string): void {
    this.sort$.next(value);
  }

  private getData(): void {
    const boardId = this.board.id as string;

    this.posts$ = this.postService.getPosts(boardId);
    this.columns$ = this.postService.getColumns(boardId).pipe(
      tap((column: Column[]) => {
        column.forEach((column: Column) => {
          if (!this.addNewPostToggleMap[column.title]) {
            this.addNewPostToggleMap[column.title] = false;
          }
        });
      })
    );
  }
}
