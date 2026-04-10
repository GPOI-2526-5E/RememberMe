import { TestBed } from '@angular/core/testing';

import { CoockieService } from './coockie.service';

describe('CoockieService', () => {
  let service: CoockieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoockieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
