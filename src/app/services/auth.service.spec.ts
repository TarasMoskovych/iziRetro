import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { FirebaseError } from '@firebase/util';
import firebase from 'firebase/compat/app';

import { AuthError, AuthUserCredential, FirebaseUser, FirebaseUserInfo, User } from '../models';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { FireAuthMock, FirestoreMock, userCredential, userData, firebaseUser, firebaseUserInfo, user, GoogleAuthProviderMock, spyOnCollection, spyOnDoc } from '../mocks';

describe('AuthService', () => {
  const error = new FirebaseError('INACTIVE', 'Your Account is inactive. Please, confirm your email.');
  let service: AuthService;
  let fireAuth: AngularFireAuth;
  let firestore: AngularFirestore;
  let router: Router;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['handleError', 'showMessage']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthService,
        { provide: AngularFireAuth, useClass: FireAuthMock },
        { provide: AngularFirestore, useClass: FirestoreMock },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    });

    fireAuth = TestBed.inject(AngularFireAuth);
    firestore = TestBed.inject(AngularFirestore);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');
  });

  const recreateService = () => {
    service = TestBed.inject(AuthService);
  };

  it('should be created', () => {
    recreateService();
    expect(service).toBeTruthy();
  });

  describe('getFirebaseUser', () => {
    it('should be created when user is guest', () => {
      spyOnProperty(fireAuth, 'authState').and.returnValue(of(null));
      recreateService();

      expect(service).toBeTruthy();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    describe('redirect to dashboard', () => {
      beforeEach(() => {
        spyOnProperty(fireAuth, 'authState').and.returnValue(of({ ...firebaseUser, emailVerified: true }));
      });

      it('should redirect to dashboard when logged in and current route url is "login"', () => {
        spyOnProperty(router, 'url').and.returnValue('login');
        recreateService();
      });

      it('should redirect to dashboard when logged in and current route url is "register"', () => {
        spyOnProperty(router, 'url').and.returnValue('register');
        recreateService();
      });

      afterEach(() => {
        expect(router.navigate).toHaveBeenCalledOnceWith(['dashboard'], { queryParams: {} });
      })
    });
  });

  describe('login', () => {
    it('should login with email and password', (done: DoneFn) => {
      const payload = {
        credential: userCredential.credential, user: { ...userCredential.user, emailVerified: true },
      };

      spyOn(fireAuth, 'signInWithEmailAndPassword').and.resolveTo(payload as AuthUserCredential);
      recreateService();

      service.login(userData).subscribe((fui: FirebaseUserInfo | AuthError) => {
        expect(fui).toEqual({ ...firebaseUser, emailVerified: true } as FirebaseUserInfo);
        done();
      });
    });

    it('should not login when user is invalid', (done: DoneFn) => {
      const payload = {
        credential: userCredential.credential, user: null,
      };

      notificationServiceSpy.handleError.and.returnValue(of(error));
      spyOn(fireAuth, 'signInWithEmailAndPassword').and.resolveTo(payload as AuthUserCredential);
      spyOn(fireAuth, 'signOut');
      recreateService();

      service.login(userData).subscribe(() => {
        expect(notificationServiceSpy.handleError).toHaveBeenCalledOnceWith(error);
        expect(fireAuth.signOut).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('sign in', () => {
    beforeEach(() => {
      if (!firebase?.auth?.GoogleAuthProvider) {
        firebase.auth = { GoogleAuthProvider: GoogleAuthProviderMock } as any;
      }
    });

    it('should sign in with google provider', (done: DoneFn) => {
      spyOn(fireAuth, 'signInWithPopup').and.resolveTo(userCredential);
      recreateService();
      spyOn(service, 'updateUser').and.returnValue(of(userCredential.user as FirebaseUser));

      service.signIn().subscribe(fui => {
        expect(fui).toEqual(userCredential.user as FirebaseUserInfo);
        expect(service.updateUser).toHaveBeenCalled();
        done();
      });
    });

    it('should show the message when login is failed', (done: DoneFn) => {
      spyOn(fireAuth, 'signInWithPopup').and.rejectWith(error);
      recreateService();

      notificationServiceSpy.handleError.and.returnValue(of(error));
      service.signIn().subscribe(() => {
        expect(notificationServiceSpy.handleError).toHaveBeenCalledOnceWith(error);
        done();
      });
    });
  });

  describe('register', () => {
    beforeEach(() => {
      spyOn(userCredential.user as FirebaseUser, 'sendEmailVerification');
      spyOn(userCredential.user as FirebaseUser, 'updateProfile').and.resolveTo();
    });

    it('should return null when user is empty', (done: DoneFn) => {
      spyOn(fireAuth, 'createUserWithEmailAndPassword').and.resolveTo({ credential: userCredential.credential, user: null });
      recreateService();
      spyOn(service, 'updateUser').and.returnValue(of(null as any));

      service.register(userData).subscribe((fui: FirebaseUserInfo | AuthError) => {
        expect(fui).toBeNull();
        expect(userCredential.user?.sendEmailVerification).not.toHaveBeenCalled();
        done();
      });
    });

    it('should register user', (done: DoneFn) => {
      spyOn(fireAuth, 'createUserWithEmailAndPassword').and.resolveTo(userCredential);
      recreateService();
      spyOn(service, 'updateUser').and.returnValue(of(userCredential.user as FirebaseUser));

      service.register(userData).subscribe((fui: FirebaseUserInfo | AuthError) => {
        expect(fui).toEqual(userCredential.user as FirebaseUser);
        expect(userCredential.user?.sendEmailVerification).toHaveBeenCalled();
        expect(userCredential.user?.updateProfile).toHaveBeenCalled();
        expect(notificationServiceSpy.showMessage).toHaveBeenCalledWith('Registered.');
        done();
      });
    });

    it('should catch an error during registration', (done: DoneFn) => {
      const error = new FirebaseError('ERROR', 'Cannot register new user');

      notificationServiceSpy.handleError.and.returnValue(of(error));
      spyOn(fireAuth, 'createUserWithEmailAndPassword').and.rejectWith(error);
      recreateService();

      service.register(userData).subscribe(() => {
        expect(notificationServiceSpy.handleError).toHaveBeenCalledWith(error)
        done();
      });
    });
  });

  describe('logout', () => {
    it('should logout', (done: DoneFn) => {
      spyOn(fireAuth, 'signOut').and.returnValue(Promise.resolve());
      recreateService();

      service.logout().subscribe(() => {
        expect(router.navigateByUrl).toHaveBeenCalledOnceWith('login');
        done();
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return a user from users collection', () => {
      spyOnProperty(fireAuth, 'authState').and.returnValue(of(firebaseUser));
      spyOnCollection(firestore, [user], 'users');
      recreateService();

      service.getCurrentUser().subscribe((u: User) => {
        expect(u).toEqual(user);
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', () => {
      spyOnCollection(firestore, [user], 'users');
      recreateService();

      service.getUserByEmail(user.email).subscribe((u: User) => {
        expect(u).toEqual(user);
      });
    });
  });

  describe('updateUser', () => {
    it('should set user', (done: DoneFn) => {
      spyOnDoc(firestore);
      recreateService();

      service.updateUser(firebaseUserInfo).subscribe((fui: FirebaseUserInfo) => {
        expect(fui).toEqual(firebaseUserInfo);
        done();
      });
    });

    it('should update user', (done: DoneFn) => {
      spyOnDoc(firestore, true);
      recreateService();

      service.updateUser(firebaseUserInfo, { displayName: 'new name' }).subscribe((fui: FirebaseUserInfo) => {
        expect(fui).toEqual(firebaseUserInfo);
        done();
      });
    });
  });

  describe('generateAvatar', () => {
    it('should return a link with user id', () => {
      recreateService();

      expect(service['generateAvatar']('5')).toMatch('http://gravatar.com/avatar');
    });
  });
});
