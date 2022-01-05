import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Column, FirestoreCollectionReference, FirestoreQuerySnapshot, Post, Like } from '../models';
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
    return this.getColumnsRef(boardId).valueChanges();
  }

  getPosts(boardId: string): Observable<Post[]> {
    return this.getPostsRef(boardId, 'boardId').valueChanges();
  }

  getLikes(boardId: string): Observable<Like[]>  {
    return this.getLikesRef(boardId, 'boardId').valueChanges();
  }

  initColumns(boardId: string): Observable<boolean> {
    const data: Column[] = [
      {
        boardId,
        color: 'rgb(3 186 169 / 40%)',
        position: 1,
        title: 'Went Well',
      },
      {
        boardId,
        color: 'rgb(255 0 87 / 40%)',
        position: 2,
        title: 'To Improve'
      },
      {
        boardId,
        color: 'rgb(156 39 176 / 40%)',
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
      id: this.generatorService.generateId(64),
    }));
  }

  editPost(post: Post, remove: boolean): Observable<void> {
    const postId = post.id as string;

    return this.getPostsRef(postId)
      .get()
      .pipe(
        switchMap(async(snapshot: FirestoreQuerySnapshot) => {
          if (!snapshot) return;
          if (remove) {
            const likesSnapshot: FirestoreQuerySnapshot = await this.getLikesRef(postId, 'postId').get().toPromise();
            likesSnapshot.forEach((doc: DocumentData) => doc.ref.delete());
          }

          return this.afs.doc(`posts/${snapshot.docs[0].id}`)[remove ? 'delete': 'update'](post);
        })
      );
  }

  addLike(like: Like): Observable<DocumentReference> {
    return from(this.afs.collection<Like>('likes').add({
      ...like,
      id: this.generatorService.generateId(),
    }));
  }

  removeLike(like: Like): Observable<void | null> {
    return this.getLikesRef(like.id as string)
      .get()
      .pipe(
        switchMap((snapshot: FirestoreQuerySnapshot) => {
          if (!snapshot) return of(null);
          return this.afs.doc(`likes/${snapshot.docs[0].id}`).delete();
        })
      );
  }

  getColumnsRef(boardId: string): AngularFirestoreCollection<Column> {
    return this.afs.collection<Column>('columns', (ref: FirestoreCollectionReference) => ref
      .where('boardId', '==', boardId));
  }

  getPostsRef(value: string, key: string = 'id'): AngularFirestoreCollection<Post> {
    return this.afs.collection<Post>('posts', (ref: FirestoreCollectionReference) => ref
      .where(key, '==', value));
  }

  getLikesRef(value: string, key: string = 'id'): AngularFirestoreCollection<Like> {
    return this.afs.collection<Like>('likes', (ref: FirestoreCollectionReference) => ref
      .where(key, '==', value));
  }
}
