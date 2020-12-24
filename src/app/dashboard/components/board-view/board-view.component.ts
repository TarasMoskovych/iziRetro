import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
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
  board: Board;
  verticalLayout = false;
  columns$: Observable<Column[]>;
  show:any = {};

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.board = this.route.snapshot.data['board'];
    this.columns$ = this.postService.getColumns(this.board.id as string).pipe(
      tap((column: Column[]) => {
        column.forEach(column => {
          this.show[column.title] = false;
        });
      })
    );
  }

  onLayoutChange(e: MatButtonToggleChange): void {
    this.verticalLayout = e.value === 'VERTICAL';
  }

  toggle(columnTitle: string, cond: boolean): void {
    this.show[columnTitle] = cond;
  }

  onSaveNewItem(value: string, column: Column): void {
    this.postService.addPost(value, column, this.board.id as string).pipe(take(1)).subscribe(val => {
      console.log(val);
    });
  }
}
