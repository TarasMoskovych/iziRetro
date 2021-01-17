import { FilterPipe } from './filter.pipe';

const users = [
  {
    id: 1,
    name: 'John',
  },
  {
    id: 2,
    name: 'Tom',
  },
  {
    id: 3,
    name: 'Jack',
  },
  {
    id: 4,
    name: 'Johnny',
  },
];

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  })

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should not filter when "inputString" argument is invalid', () => {
    expect(pipe.transform([1, 2], 'name', '')).toEqual([1, 2]);
  });

  it('should not filter when "items" argument is invalid', () => {
    expect(pipe.transform(null as any, 'name', 'search')).toBeNull();
  });

  it('should return filtered array when valid arguments passed', () => {
    expect(pipe.transform(users, 'name', 'john').length).toBe(2);
  });
});
