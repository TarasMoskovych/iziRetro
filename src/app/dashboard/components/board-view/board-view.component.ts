import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { Board, Column, Post } from 'src/app/models';
import { DashboardService } from 'src/app/services/dashboard.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewComponent implements OnInit {
  board$: Observable<Board>;
  columns$: Observable<Column[]>;
  posts$: Observable<Post[]>;
  search$ = new BehaviorSubject<string>('');
  sort$ = new BehaviorSubject<string>('date');

  boardId: string;
  verticalLayout = false;
  addNewPostToggleMap: { [key: string]: boolean } = {};
  editPostToggleMap: { [key: string]: boolean } = {};

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.params['id'];
    this.boardId ? this.getData() : this.router.navigateByUrl('dashboard');
  }

  onLayoutChange(e: MatButtonToggleChange): void {
    this.verticalLayout = e.value === 'VERTICAL';
  }

  toggle(columnTitle: string, cond: boolean): void {
    this.addNewPostToggleMap[columnTitle] = cond;
  }

  onSaveNewItem(value: string, column: Column): void {
    if (!value.length) return;

    this.addNewPostToggleMap[column.title] = false;
    this.postService.addPost({ value, columnPosition: column.position, boardId: this.boardId })
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
    this.board$ = this.dashboardService.getBoard(this.boardId);
    this.posts$ = this.postService.getPosts(this.boardId);
    this.columns$ = this.postService.getColumns(this.boardId).pipe(
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
