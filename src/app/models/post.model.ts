export interface Column {
  boardId: string;
  title: string;
  color: string;
  position: number;
}

export interface Post {
  id?: string;
  date?: number;
  boardId: string;
  columnPosition: number;
  creator: string;
  value: string;
}
