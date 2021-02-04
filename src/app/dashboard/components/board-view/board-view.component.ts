import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { MatIconRegistry } from '@angular/material/icon';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { Board, Column, Post, Like, FirebaseUser, Sort, dashBoardSorts } from 'src/app/models';
import { DataExportService } from 'src/app/services/data-export.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { PostService } from 'src/app/services/post.service';
import { VERTICAL_LAYOUT, HORIZONTAL_LAYOUT } from '../../../../assets/icons';
import { AuthService } from 'src/app/services/auth.service';

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
  likes$: Observable<Like[]>;
  search$ = new BehaviorSubject<string>('');
  sort$ = new BehaviorSubject<Sort>(dashBoardSorts[1]);

  boardId: string;
  verticalLayout = false;
  addNewPostToggleMap: { [key: string]: boolean } = {};
  editPostToggleMap: { [key: string]: boolean } = {};
  likesMap: { [key: string]: Like[] } = {};
  sorts: Sort[] = dashBoardSorts;
  user: FirebaseUser;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private dashboardService: DashboardService,
    private dataExportService: DataExportService,
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
  ) {
    iconRegistry.addSvgIconLiteral('vertical', sanitizer.bypassSecurityTrustHtml(VERTICAL_LAYOUT));
    iconRegistry.addSvgIconLiteral('horizontal', sanitizer.bypassSecurityTrustHtml(HORIZONTAL_LAYOUT));
  }

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
    this.postService.addPost({ value, columnPosition: column.position, boardId: this.boardId, creator: this.user.email as string })
      .pipe(take(1))
      .subscribe();
  }

  onToggleItem(e: { post: Post, edit: boolean }, completed: boolean): void {
    if (!completed) {
      this.editPostToggleMap[e.post.id as string] = e.edit;
    }
  }

  onEditItem(post: Post, remove: boolean = false): void {
    this.editPostToggleMap[post.id as string] = false;
    this.postService.editPost(post, remove)
      .pipe(take(1))
      .subscribe();
  }

  onSearch(value: string): void {
    this.search$.next(value);
  }

  onSort(value: Sort): void {
    this.sort$.next(value);
  }

  onShareUrl(board: Board): void {
    this.dashboardService.shareUrl(board);
  }

  onExport(board: Board): void {
    this.dataExportService.export(board);
  }

  onAddRemoveLike(post: Post): void {
    const { displayName, photoURL, email } = this.user;
    const like = this.likesMap[post.id as string]?.find(like => like.user.email === email);

    if (like) {
      this.postService.removeLike(like)
        .pipe(take(1))
        .subscribe();
    } else {
      this.postService.addLike({
        boardId: post.boardId,
        postId: post.id as string,
        user: {
          displayName: displayName as string,
          email: email as string,
          photoURL: photoURL as string
        }
      })
      .pipe(take(1))
      .subscribe();
    }
  }

  private getData(): void {
    this.board$ = this.dashboardService.getBoard(this.boardId)
      .pipe(tap((board: Board) => {
        if (board.completed) {
          Object.keys(this.addNewPostToggleMap).forEach((key: string) => this.addNewPostToggleMap[key] = false);
          Object.keys(this.editPostToggleMap).forEach((key: string) => this.editPostToggleMap[key] = false);
        }
      }));

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
    this.likes$ = this.postService.getLikes(this.boardId).pipe(
      tap((likes: Like[]) => {
        this.likesMap = likes.reduce((acc: any, curr: Like) => {
          if (!acc[curr.postId]) {
            acc[curr.postId] = [curr];
          } else {
            acc[curr.postId].push(curr);
          }
          return acc;
        }, {});
      })
    );

    this.authService.getCurrentUser()
      .pipe(take(1))
      .subscribe((user: FirebaseUser) => this.user = user);
  }
}
