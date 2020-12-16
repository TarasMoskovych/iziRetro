import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

import { Board } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private afs: AngularFirestore,
  ) { }

  addBoard(board: Board): Observable<DocumentReference> {
    return from(this.afs.collection<Board>('boards').add(board));
  }

  getBoards(): Observable<Board[]> {
    return this.afs.collection<Board>('boards').valueChanges()
  }
}
