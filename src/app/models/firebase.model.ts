import firebase from 'firebase/compat/app';
import { WhereFilterOp } from '@firebase/firestore-types';

export type AuthUserCredential = firebase.auth.UserCredential;
export type AuthCredential = firebase.auth.AuthCredential;
export type AuthError = firebase.auth.Error;
export type FirestoreCollectionReference = firebase.firestore.CollectionReference;
export type FirestoreFieldValue = firebase.firestore.FieldValue;
export type FirestoreQuerySnapshot = firebase.firestore.QuerySnapshot;
export type FirestoreTimestamp = firebase.firestore.Timestamp;
export type FirebaseUser = firebase.User;
export type FirebaseUserInfo = firebase.UserInfo;
export type FirebaseWhereFilterOp = WhereFilterOp;
export const googleAuthProvider = () => new firebase.auth.GoogleAuthProvider();
