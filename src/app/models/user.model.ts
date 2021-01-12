export interface User {
  displayName: string;
  email: string;
  photoURL?: string;
  sharedBoards?: string[];
}

export interface UserData extends User {
  password: string;
}
