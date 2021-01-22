import { of } from 'rxjs';
import { AuthCredential, AuthUserCredential, FirebaseUser, FirebaseUserInfo, User, UserData } from '../models';

export class GoogleAuthProviderMock {}

export class FireAuthMock {
  get authState() {
    return of({});
  }

  signInWithEmailAndPassword() {}
  createUserWithEmailAndPassword() {}
  signOut() {}
  signInWithPopup() {}
}

export class FirestoreMock {
  collection() {}
  doc() {}
}

export const firebaseUser: FirebaseUser = {
  displayName: 'Test',
  email: 'abc@gmail.com',
  sendEmailVerification: () => Promise.resolve(),
  updateProfile: (data: FirebaseUserInfo) => Promise.resolve(),
  uid: '12345',
} as FirebaseUser;

export const userCredential: AuthUserCredential = {
  user: firebaseUser as FirebaseUser,
  credential: {
    providerId: '11111',
  } as AuthCredential,
};

export const firebaseUserInfo: FirebaseUserInfo = {
  displayName: 'test name',
  email: 'abc@gmail.com',
  phoneNumber: '1234',
  photoURL: null,
  providerId: '1',
  uid: '1',
};

export const userData: UserData = {
  displayName: 'Test',
  email: 'abc@gmail.com',
  password: '111111',
};

export const user: User = {
  displayName: 'Test',
  email: 'abc@gmail.com',
};
