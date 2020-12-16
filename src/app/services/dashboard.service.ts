import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Board, FirebaseUser, FirestoreCollectionReference } from '../models';
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
          .add({ ...board, id: this.generatorService.generateId(64), creator: user.email as string }));
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
}
