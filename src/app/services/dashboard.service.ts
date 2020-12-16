import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Board, FirebaseUser, FirestoreCollectionReference, FirestoreQuerySnapshot } from '../models';
import { AuthService } from './auth.service';
import { GeneratorService } from './generator.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private generatorService: GeneratorService,
  ) { }

  addBoard(board: Board): Observable<DocumentReference> {
    return this.authService.getCurrentUser()
      .pipe(switchMap((user: FirebaseUser) => {
        return from(this.afs.collection<Board>('boards')
          .add({ ...board, id: this.generatorService.generateId(64), date: Date.now(), creator: user.email as string }));
      }));
  }

  getBoards(): Observable<Board[]> {
    return this.authService.getCurrentUser()
      .pipe(switchMap((user: FirebaseUser) => {
        return this.afs.collection<Board>('boards', (ref: FirestoreCollectionReference) => ref
          .where('creator', '==', user.email))
          .valueChanges();
      }));
  }

  getBoard(id: string): Observable<Board> {
    return this.getBoardByIdRef(id)
      .valueChanges()
      .pipe((map((boards: Board[]) => boards[0])));
  }

  removeBoard(board: Board) {
    return this.getBoardByIdRef(board.id as string).get()
      .pipe(switchMap((snapshot: FirestoreQuerySnapshot) => {
        return of(this.afs.doc(`boards/${snapshot.docs[0].id}`).delete());
      }));
  }

  private getBoardByIdRef(id: string): AngularFirestoreCollection<Board> {
    return this.afs.collection<Board>('boards', (ref: FirestoreCollectionReference) => ref
      .where('id', '==', id));
  }
}
