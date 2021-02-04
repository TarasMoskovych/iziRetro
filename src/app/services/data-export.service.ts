import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

import { utils as XLSXUtils, writeFile } from 'xlsx';
import { WorkSheet } from 'xlsx/types';

import { Board, Column, Post } from '../models';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root'
})
export class DataExportService {
  private fileExtension = '.xlsx';

  constructor(
    private postService: PostService,
  ) { }

  export(board: Board): void {
    const boardId: string = board.id as string;

    combineLatest([
      this.postService.getColumns(boardId),
      this.postService.getPosts(boardId),
    ]).pipe(take(1))
      .subscribe(([columns, posts]) => this.exportToExcel(this.prepareData(columns, posts), board.title));
  }

  private prepareData(columns: Column[], posts: Post[]): Object[] {
    let data: Object[] = [];
    let length: number;

    const columnsMap = columns.reduce((acc: { [key: string]: string[] }, column: Column) => {
      acc[column.position] = [column.title.toUpperCase()];
      return acc;
    }, {});

    const postsMap = posts.reduce((acc: { [key: string]: string[] }, post: Post) => {
      acc[post.columnPosition].push(post.value);
      return acc;
    }, { ...columnsMap });

    length = Math.max(...Object.keys(postsMap).map((key: string) => postsMap[key].length));

    for (let i = 0; i < length; i++) {
      data.push({ 1: postsMap[1][i], 2: postsMap[2][i], 3: postsMap[3][i] });
    }

    return data;
  }

  private exportToExcel(data: Object[], name: string): void {
    const ws: WorkSheet = XLSXUtils.json_to_sheet(data, { skipHeader: true });
    const wb = XLSXUtils.book_new();

    ws['!cols'] = [{ width: 30, wch: 20 }, { width: 30 }, { width: 30 }];
    XLSXUtils.book_append_sheet(wb, ws, name);

    writeFile(wb, `${name}${this.fileExtension}`);
  }
}
