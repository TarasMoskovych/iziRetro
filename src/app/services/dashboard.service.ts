import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { combineLatest, from, Observable, of } from 'rxjs';
import { exhaustMap, map, switchMap } from 'rxjs/operators';

import { Board, FirebaseUser, FirebaseUserInfo, FirebaseWhereFilterOp, FirestoreCollectionReference, FirestoreQuerySnapshot, User } from '../models';
import { AuthService } from './auth.service';
import { GeneratorService } from './generator.service';
import { PostService } from './post.service';
import { NotificationService } from './notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ShareComponent } from '../dashboard/components/share/share.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private authService: AuthService,
    private clipboard: Clipboard,
    private generatorService: GeneratorService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private postService: PostService
  ) { }

  addBoard(board: Board): Observable<boolean> {
    const boardId = this.generatorService.generateId(64);

    return this.authService.getFirebaseUser()
      .pipe(
        switchMap((user: FirebaseUser) => {
          return from(this.afs.collection<Board>('boards')
            .add({ ...board, id: boardId, date: Date.now(), creator: user.email as string }));
        }),
        switchMap(() => this.postService.initColumns(boardId))
    );
  }

  getMyBoards(): Observable<Board[]> {
    return this.authService.getFirebaseUser()
      .pipe(switchMap((user: FirebaseUser) => {
        return this.getBoardRef(user.email as string, 'creator').valueChanges();
      }));
  }

  getBoardsSharedWithMe(): Observable<Board[]> {
    return this.authService.getCurrentUser()
      .pipe(
        switchMap((user: User) => {
          if (!user?.sharedBoards?.length) return of([]);
          return this.getBoardRef(user.sharedBoards, 'id', 'in').valueChanges();
        })
      );
  }

  getBoard(id: string): Observable<Board> {
    return this.getBoardRef(id)
      .valueChanges()
      .pipe((map((boards: Board[]) => boards[0])));
  }

  editBoard(board: Board): Observable<void> {
    return this.getBoardRef(board.id as string).get()
      .pipe(switchMap((snapshot: FirestoreQuerySnapshot) => {
        return this.afs.doc(`boards/${snapshot.docs[0].id}`).update({ ...board });
      }));
  }

  shareBoard(): Observable<FirebaseUserInfo | null> {
    const boardId = this.route.snapshot.queryParams['redirectUrl'];
    let firebaseUser: FirebaseUser;

    if (!boardId) return of(null);
    return combineLatest([
      this.authService.getFirebaseUser(),
      this.getBoard(boardId),
    ]).pipe(
      exhaustMap(([user, board]) => {
        firebaseUser = user;

        if (board.creator === firebaseUser.email || board.completed) return of(null);
        return this.authService.getUserByEmail(firebaseUser.email as string);
      }),
      exhaustMap((user: User | null) => {
        if (user) {
          return this.authService.updateUser(firebaseUser, { sharedBoards: [ ...new Set([ ...user.sharedBoards || [], boardId ]) ]});
        }
        return of(null);
      }),
    );
  }

  shareUrl(board: Board): void {
    const url = `${window.location.origin}/dashboard?redirectUrl=${board.id}`;

    this.clipboard.copy(url);
    this.notificationService.showMessage('Copied to clipboard');
    this.dialog.open(ShareComponent, {
      data: url,
      panelClass: 'share-modal',
    });
  }

  removeBoard(boardId: string): Observable<void> {
    return this.getBoardRef(boardId).get()
      .pipe(
        switchMap((snapshot: FirestoreQuerySnapshot) => this.afs.doc(`boards/${snapshot.docs[0].id}`).delete()),
        switchMap(async() => {
          const columnsSnapshot: FirestoreQuerySnapshot = await this.postService.getColumnsRef(boardId).get().toPromise();
          columnsSnapshot.forEach((doc: DocumentData) => doc.ref.delete());

          const postsSnapshot: FirestoreQuerySnapshot = await this.postService.getPostsRef(boardId, 'boardId').get().toPromise();
          postsSnapshot.forEach((doc: DocumentData) => doc.ref.delete());

          const likesSnapshot: FirestoreQuerySnapshot = await this.postService.getLikesRef(boardId, 'boardId').get().toPromise();
          likesSnapshot.forEach((doc: DocumentData) => doc.ref.delete());
        }),
      );
  }

  private getBoardRef(
    value: string | string[],
    key: string = 'id',
    operator: FirebaseWhereFilterOp = '==',
  ): AngularFirestoreCollection<Board> {
    return this.afs.collection<Board>('boards', (ref: FirestoreCollectionReference) => ref.where(key, operator, value));
  }
}
