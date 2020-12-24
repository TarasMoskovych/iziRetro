import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { exhaustMap, map, switchMap } from 'rxjs/operators';

import { Board, FirebaseUser, FirestoreCollectionReference, FirestoreQuerySnapshot } from '../models';
import { AuthService } from './auth.service';
import { GeneratorService } from './generator.service';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private authService: AuthService,
    private generatorService: GeneratorService,
    private postService: PostService
  ) { }

  addBoard(board: Board): Observable<boolean> {
    const boardId = this.generatorService.generateId(64);

    return this.authService.getCurrentUser()
      .pipe(
        switchMap((user: FirebaseUser) => {
          return from(this.afs.collection<Board>('boards')
            .add({ ...board, id: boardId, date: Date.now(), creator: user.email as string }));
        }),
        switchMap(() => this.postService.initColumns(boardId))
    );
  }

  getMyBoards(): Observable<Board[]> {
    return this.authService.getCurrentUser()
      .pipe(switchMap((user: FirebaseUser) => {
        return this.afs.collection<Board>('boards', (ref: FirestoreCollectionReference) => ref
          .where('creator', '==', user.email))
          .valueChanges();
      }));
  }

  getBoardsSharedWithMe(): Observable<Board[]> {
    return this.authService.getCurrentUser()
      .pipe(switchMap((user: FirebaseUser) => {
        return this.afs.collection<Board>('boards', (ref: FirestoreCollectionReference) => ref
          .where('sharedWith', 'array-contains', user.email))
          .valueChanges();
      }));
  }

  getBoard(id: string): Observable<Board> {
    return this.getBoardByIdRef(id)
      .valueChanges()
      .pipe((map((boards: Board[]) => boards[0])));
  }

  shareBoard(): Observable<null | void> {
    const boardId = this.route.snapshot.queryParams['redirectUrl'];
    let user: FirebaseUser;
    let board: Board;

    if (!boardId) return of(null);
    return this.authService.getCurrentUser()
      .pipe(
        exhaustMap((u: FirebaseUser) => {
          user = u;
          return this.getBoard(boardId);
        }),
        exhaustMap((b: Board) => {
          board = b;

          if (board.creator === user.email || board.sharedWith?.length && board.sharedWith.includes(user.email as string)) return of(null);
          return this.getBoardByIdRef(boardId).get();
        }),
        exhaustMap((snapshot: QuerySnapshot<Board> | null) => {
          const emails: string[] = board.sharedWith || [];

          if (!snapshot) return of(null);
          return this.afs.doc(`boards/${snapshot.docs[0].id}`).update({ sharedWith: [...emails, user.email] });
        }),
      );
  }

  removeBoard(board: Board): Observable<void> {
    return this.getBoardByIdRef(board.id as string).get()
      .pipe(switchMap((snapshot: FirestoreQuerySnapshot) => {
        return this.afs.doc(`boards/${snapshot.docs[0].id}`).delete();
      }));
  }

  private getBoardByIdRef(id: string): AngularFirestoreCollection<Board> {
    return this.afs.collection<Board>('boards', (ref: FirestoreCollectionReference) => ref
      .where('id', '==', id));
  }
}
