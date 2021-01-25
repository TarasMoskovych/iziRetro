import { TestBed } from '@angular/core/testing';

import { GeneratorService } from './generator.service';

describe('GeneratorService', () => {
  let service: GeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return string with default 16 symbols', () => {
    expect(service.generateId().length).toBe(16);
  });

  it('should return string with custom 32 symbols', () => {
    expect(service.generateId(32).length).toBe(32);
  });
});
