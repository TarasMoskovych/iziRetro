import { TestBed } from '@angular/core/testing';

import { BoardResolverService } from './board-resolver.service';

describe('BoardResolverService', () => {
  let service: BoardResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
