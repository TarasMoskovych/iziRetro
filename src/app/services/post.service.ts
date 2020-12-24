import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Column, FirestoreCollectionReference, FirestoreQuerySnapshot, Post } from '../models';
import { GeneratorService } from './generator.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private afs: AngularFirestore,
    private generatorService: GeneratorService,
  ) { }

  getColumns(boardId: string): Observable<Column[]> {
    return this.afs.collection<Column>('columns', (ref: FirestoreCollectionReference) => ref
      .where('boardId', '==', boardId))
      .valueChanges();
  }

  getPosts(boardId: string): Observable<Post[]> {
    return this.afs.collection<Post>('posts', (ref: FirestoreCollectionReference) => ref
      .where('boardId', '==', boardId))
      .valueChanges();
  }

  initColumns(boardId: string): Observable<boolean> {
    const data: Column[] = [
      {
        boardId,
        color: '#009688',
        position: 1,
        title: 'Went Well',
      },
      {
        boardId,
        color: '#E91E63',
        position: 2,
        title: 'To Improve'
      },
      {
        boardId,
        color: '#9C27B0',
        position: 3,
        title: 'Action Item'
      }
    ];

    data.forEach((column: Column) => {
      this.afs.collection('columns').add(column);
    });

    return of(true);
  }


  addPost(post: Post): Observable<DocumentReference> {
    return from(this.afs.collection<Post>('posts').add({
      ...post,
      date: Date.now(),
      id: this.generatorService.generateId(),
    }));
  }

  editPost(post: Post): Observable<void | null> {
    return this.afs.collection<Post>('posts', (ref: FirestoreCollectionReference) => ref
      .where('id', '==', post.id))
      .get()
      .pipe(
        switchMap((snapshot: FirestoreQuerySnapshot) => {
          if (!snapshot) return of(null);
          return this.afs.doc(`posts/${snapshot.docs[0].id}`).update(post);
        })
      );
  }
}