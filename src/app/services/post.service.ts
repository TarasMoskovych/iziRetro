import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Column, FirestoreCollectionReference, Post } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private afs: AngularFirestore
  ) { }

  getColumns(boardId: string): Observable<Column[]> {
    return this.afs.collection<Column>('columns', (ref: FirestoreCollectionReference) => ref
      .where('boardId', '==', boardId))
      .valueChanges();
  }

  initColumns(boardId: string): Observable<boolean> {
    const data: Column[] = [
      {
        boardId,
        posts: [],
        title: 'Went Well',
      },
      {
        boardId,
        posts: [],
        title: 'To Improve'
      },
      {
        boardId,
        posts: [],
        title: 'Action Item'
      }
    ];

    data.forEach((column: Column) => {
      this.afs.collection('columns').add(column);
    });

    return of(true);
  }

  addPost(value: string, column: Column, boardId: string): Observable<any> {
    return this.afs.collection<Column>('columns', (ref: FirestoreCollectionReference) => ref
      .where('boardId', '==', boardId)
      .where('title', '==', column.title))
      .get()
      .pipe(
        switchMap((snapshot: QuerySnapshot<Column> | null) => {
          if (!snapshot) return of(null);
          return this.afs.doc(`columns/${snapshot.docs[0].id}`).update({ posts: [...column.posts, {value}] });
        })
      );
  }

}
