import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import {
  AuthCredential,
  AuthUserCredential,
  Board,
  Column,
  FirebaseUser,
  FirebaseUserInfo,
  Like,
  Post,
  User,
  UserData
} from '../models';

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

export const columns: Column[] = [
  {
    boardId: '1',
    color: 'green',
    position: 1,
    title: 'Went well',
  },
  {
    boardId: '1',
    color: 'red',
    position: 2,
    title: 'To improve',
  },
  {
    boardId: '1',
    color: 'blue',
    position: 3,
    title: 'Action item',
  },
];

export const posts: Post[] = [
  {
    boardId: '1',
    columnPosition: 1,
    value: 'Post 1',
  },
  {
    boardId: '2',
    columnPosition: 2,
    value: 'Post 2',
  },
  {
    boardId: '2',
    columnPosition: 2,
    value: 'Post 3',
  },
];

export const board: Board = {
  title: 'Test board',
  completed: false,
  id: '12345',
};

export const likes: Like[] = [
  {
    boardId: '1',
    postId: '1',
    user,
  },
  {
    boardId: '1',
    postId: '2',
    user,
  },
  {
    boardId: '1',
    postId: '3',
    user,
  },
];

// test utilities
export const spyOnCollection = (firestoreRef: AngularFirestore, value?: any, key?: string) => {
  spyOn(firestoreRef, 'collection').and.callFake((path: any, queryFn: any) => {
    if (key) {
      expect(path).toBe(key);
    }

    if (typeof queryFn === 'function') {
      queryFn({ where: () => null });
    }

    return {
      add: (value: any) => Promise.resolve(value),
      get: () => of(value === null ? null : { docs: [{ id: 1 }] }),
      valueChanges: () => of(value),
    } as any;
  });
};

export const spyOnDoc = (firestoreRef: AngularFirestore, exists: boolean = false) => {
  spyOn(firestoreRef, 'doc').and.callFake(() => {
    return {
      get: () => of({ exists }),
      set: () => Promise.resolve(),
      delete: (value: any) => Promise.resolve(value),
      update: (value: any) => Promise.resolve(value),
    } as any;
  });
};
