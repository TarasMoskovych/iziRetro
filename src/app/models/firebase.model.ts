import firebase from 'firebase/app';

export type AuthUserCredential = firebase.auth.UserCredential;
export type AuthError = firebase.auth.Error;
export type FirestoreCollectionReference = firebase.firestore.CollectionReference;
export type FirestoreFieldValue = firebase.firestore.FieldValue;
export type FirestoreQuerySnapshot = firebase.firestore.QuerySnapshot;
export type FirestoreTimestamp = firebase.firestore.Timestamp;
export type FirebaseUser = firebase.User;
export type FirebaseUserInfo = firebase.UserInfo;
export const googleAuthProvider = () => new firebase.auth.GoogleAuthProvider();
