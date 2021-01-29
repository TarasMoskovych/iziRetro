import { User } from "./user.model";

export interface Like {
  id?: string;
  boardId: string;
  postId: string;
  user: User;
}
