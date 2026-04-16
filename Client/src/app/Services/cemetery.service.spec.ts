import { TestBed } from '@angular/core/testing';

import { CemeteryService } from './cemetery.service';

describe('CemeteryService', () => {
  let service: CemeteryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CemeteryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
