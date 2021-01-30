export interface Sort {
  asc: boolean;
  value: string;
  title?: string;
}

export const boardSorts: Sort[] = [
  {
    asc: true,
    value: 'date',
  },
  {
    asc: false,
    value: 'date',
  },
  {
    asc: true,
    value: 'title',
    title: 'name',
  },
  {
    asc: false,
    value: 'title',
    title: 'name',
  },
];

export const dashBoardSorts: Sort[] = [
  {
    asc: true,
    value: 'date',
  },
  {
    asc: false,
    value: 'date',
  },
  {
    asc: true,
    value: 'value',
    title: 'name',
  },
  {
    asc: false,
    value: 'value',
    title: 'name',
  },
];
