export interface Column {
  boardId: string;
  title: string;
  posts: Post[];
}

export interface Post {
  value: string;
}
