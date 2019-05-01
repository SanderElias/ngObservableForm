import { TestBed } from '@angular/core/testing';

import { SampleServiceService } from './sample-service.service';

describe('SampleServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SampleServiceService = TestBed.get(SampleServiceService);
    expect(service).toBeTruthy();
  });
});
