import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { from, Observable} from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { AuthUserCredential, FirebaseUser, googleAuthProvider, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afauth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
  ) {
    this.afauth.authState.subscribe(user => console.log(user));
  }

  signIn(): Observable<void> {
    return from(this.afauth.signInWithPopup(googleAuthProvider()))
      .pipe(switchMap((userCredential: AuthUserCredential) => {
        const { displayName, email, photoURL } = userCredential.user as User;
        return this.afs.doc(`users/${userCredential.user?.uid}`).set({ displayName, email, photoURL });
      }));
  }

  logout(): Observable<void> {
    return from(this.afauth.signOut())
      .pipe((tap(() => this.router.navigateByUrl('login'))));
  }

  getCurrentUser(): Observable<FirebaseUser> {
    return from(this.afauth.authState) as Observable<FirebaseUser>;
  }

}
