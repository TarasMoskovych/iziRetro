import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.getCurrentUser()
      .subscribe((user: FirebaseUser) => {
        console.log(user);

        if (user && (this.router.url.includes('login') || this.router.url.includes('register'))) {
          this.router.navigate(['dashboard'], {
            queryParams: this.route.snapshot.queryParams,
          });
        }
      });
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
