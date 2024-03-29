import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import * as md5 from 'md5';
import { FirebaseError } from '@firebase/util';

import { AuthUserCredential, FirebaseUser, googleAuthProvider, UserData, FirebaseUserInfo, AuthError, User, FirestoreCollectionReference } from '../models';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: Partial<UserData>;

  constructor(
    private afauth: AngularFireAuth,
    private afs: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.getFirebaseUser()
      .subscribe((user: FirebaseUser) => {
        if (user?.emailVerified && (this.router.url.includes('login') || this.router.url.includes('register'))) {
          this.navigateToDashboard();
        }
      });
  }

  login({ email, password }: UserData): Observable<FirebaseUserInfo | AuthError> {
    return from(this.afauth.signInWithEmailAndPassword(email, password))
      .pipe(
        switchMap((userCredential: AuthUserCredential) => {
          const { user } = userCredential;

          if (user?.emailVerified) {
            return of(user);
          }
          this.afauth.signOut();
          throw new FirebaseError('INACTIVE', 'Your Account is inactive. Please, confirm your email.');
        }),
        catchError((err: AuthError) => this.notificationService.handleError(err))
      );
  }

  signIn(): Observable<FirebaseUserInfo | AuthError> {
    return from(this.afauth.signInWithPopup(googleAuthProvider()))
      .pipe(
        switchMap((userCredential: AuthUserCredential) => this.updateUser(userCredential.user as FirebaseUser)),
        catchError((err: AuthError) => this.notificationService.handleError(err)
      )
    );
  }

  register({ email, password, displayName }: UserData): Observable<FirebaseUserInfo | AuthError> {
    let userData: FirebaseUserInfo;

    return from(this.afauth.createUserWithEmailAndPassword(email, password))
      .pipe(
        switchMap((userCredential: AuthUserCredential) => {
          const { user } = userCredential;

          if (!user) return of(null);
          userData = user;
          user.sendEmailVerification();
          return from(user.updateProfile({ displayName, photoURL: this.generateAvatar(user.uid) }))
        }),
        switchMap(() => this.updateUser(userData)),
        tap(() => {
          this.userData = { email, password };
          this.notificationService.showMessage('Registered.');
        }),
        catchError((err: AuthError) => this.notificationService.handleError(err))
      );
  }

  logout(): Observable<void> {
    return from(this.afauth.signOut())
      .pipe((tap(() => this.router.navigateByUrl('login'))));
  }

  getFirebaseUser(): Observable<FirebaseUser> {
    return from(this.afauth.authState) as Observable<FirebaseUser>;
  }

  getCurrentUser(): Observable<User> {
    return this.getFirebaseUser()
      .pipe(
        exhaustMap((firebaseUser: FirebaseUser) => {
          return this.afs.collection<User>('users', (ref: FirestoreCollectionReference) => ref
            .where('email', '==', firebaseUser.email))
            .valueChanges()
            .pipe(map((users: User[]) => users[0]));
        }),
      );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.afs.collection<User>('users', (ref: FirestoreCollectionReference) => ref
      .where('email', '==', email))
      .valueChanges()
      .pipe(map((users: User[]) => users[0]));
  }

  navigateToDashboard(): void {
    this.router.navigate(['dashboard'], {
      queryParams: this.route.snapshot.queryParams,
    });
  }

  updateUser(firebaseUser: FirebaseUserInfo, updates?: Partial<User>): Observable<FirebaseUserInfo> {
    const { displayName, email, photoURL, uid } = firebaseUser;
    const user: User = { displayName, email, photoURL } as User;

    if (updates) {
      Object.assign(user, { ...updates });
    }

    return this.afs.doc(`users/${uid}`).get()
      .pipe(
        switchMap(snapshot => from(this.afs.doc(`users/${uid}`)[snapshot.exists ? 'update' : 'set'](user))),
        switchMap(() => of(firebaseUser)),
      );
  }

  private generateAvatar(id: string): string {
    return `http://gravatar.com/avatar/${md5(id)}?d=identicon`;
  }
}
