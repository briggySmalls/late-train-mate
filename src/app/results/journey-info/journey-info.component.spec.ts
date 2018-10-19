import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

import { MockResourceService } from '../../national-rail/resource.service.mock';
import { ResourceService, HspApiService } from '../../national-rail/index';
import { JourneyInfoComponent } from './journey-info.component';
import { LegComponent } from '../leg/leg.component';
import { Journey } from '../journey';

describe('JourneyInfoComponent', () => {
  let component: JourneyInfoComponent;
  let fixture: ComponentFixture<JourneyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [JourneyInfoComponent, LegComponent],
      providers: [
        NgbActiveModal,
        HspApiService,
        MockResourceService,
        MockResourceService,
        {
          deps: [MockResourceService],
          provide: ResourceService,
          useFactory: (mockService: MockResourceService) => {
            return mockService;
          }
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // Create the component
    fixture = TestBed.createComponent(JourneyInfoComponent);
    component = fixture.componentInstance;

    // Add a mock journey
    component.journey = new Journey(
      0,
      moment('2018-10-19', 'YYYY-MM-DD'),
      moment('2018-10-19', 'YYYY-MM-DD'),
      { text: 'Kings Cross', code: 'KGX' },
      { text: 'Finsbury Park', code: 'FPK' },
      { text: 'Kings Cross', code: 'KGX' },
      { text: 'Cambridge', code: 'CBG' },
      moment.duration(15, 'minutes')
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
