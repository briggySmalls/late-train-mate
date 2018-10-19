import { TestBed, async, getTestBed} from '@angular/core/testing';
import * as moment from 'moment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HspApiService } from './hsp-api.service';
import { ResourceService } from './resource.service';
import { JourneyDetails } from './hsp-details.model';
import { MetricsCollection } from './hsp-metrics.model';
import { MockResourceService} from './resource.service.mock';

const detailsJson = require('./resources/test-data/SD-201610037170624.json');
const metricsJson = require('./resources/test-data/SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json');

describe('HspApiService', () => {
  let injector: TestBed;
  let service: HspApiService;
  let httpMock: HttpTestingController;

  // Note: we Mark function as async to ensure everything is resolved by the start
  beforeEach(async(() => {
    // Configure our test environment
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        HspApiService, // Unit under test
        MockResourceService,
        {
          deps: [MockResourceService],
          provide: ResourceService,
          useFactory: (mockService: MockResourceService) => {
            mockService.setStations([
              { code: 'KGX', text: '' },
              { code: 'FPK', text: 'Finsbury Park' },
              { code: 'SVG', text: '' },
              { code: 'HIT', text: '' },
              { code: 'LET', text: '' },
              { code: 'BDK', text: '' },
              { code: 'RYS', text: '' },
              { code: 'CBG', text: 'Cambridge' }
            ]);
            return mockService;
          }
        }
      ]
    });

    // Grab the mock HTTP client we can query the connections made
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);

    // Create the unit under test
    service = injector.get(HspApiService);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('journeyDetails makes correct request', () => {
    it('should return service details', () => {
      // Configure the service assertions
      const rid = 5;
      service.journeyDetails(rid).subscribe((details: JourneyDetails) => {
        expect(details).toEqual(new JourneyDetails(detailsJson, TestBed.get(MockResourceService)));
      });

      // Configure mock Http
      const req = httpMock.expectOne('/api/hsp/details');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'rid': rid.toString() }));
      req.flush(detailsJson);
    });
  });

  describe('serviceMetrics makes correct request', () => {
    const metrics_args = {
      'fromStation': 'KGX',
      'toStation': 'CBG',
      'fromDate': '2010-11-10',
      'toDate': '2010-11-17',
      'days': 'WEEKDAYS',
      'delays': [10]
    };

    it('should make a valid request', () => {
      // Configure the service assertions
      service.serviceMetrics(
        metrics_args.fromStation, metrics_args.toStation,
        moment(metrics_args.fromDate, 'YYYY-MM-DD'), moment(metrics_args.toDate, 'YYYY-MM-DD'),
        metrics_args.days, metrics_args.delays.map(x => moment.duration(x, 'minutes'))
      ).subscribe((metrics: MetricsCollection) => {
        expect(metrics).toEqual(new MetricsCollection(metricsJson, TestBed.get(MockResourceService)));
      });

      // Configure mock Http
      const req = httpMock.expectOne('/api/hsp/metrics');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'from_loc': metrics_args.fromStation }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'to_loc': metrics_args.toStation }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'from_date': metrics_args.fromDate }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'to_date': metrics_args.toDate }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'from_time': '0000' }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'to_time': '2359' }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'days': metrics_args.days }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'tolerance': metrics_args.delays }));
      req.flush(metricsJson);
    });

    it('should not require tolerance', () => {
      // Make the call (without tolerance argument)
      service.serviceMetrics(
        metrics_args.fromStation, metrics_args.toStation,
        moment(metrics_args.fromDate, 'YYYY-MM-DD'), moment(metrics_args.toDate, 'YYYY-MM-DD'),
        metrics_args.days
      ).subscribe();

      // Configure mock Http
      const req = httpMock.expectOne('/api/hsp/metrics');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'from_loc': metrics_args.fromStation }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'to_loc': metrics_args.toStation }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'from_date': metrics_args.fromDate }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'to_date': metrics_args.toDate }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'from_time': '0000' }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'to_time': '2359' }));
      expect(req.request.body).toEqual(jasmine.objectContaining({ 'days': metrics_args.days }));
      expect(req.request.body).not.toEqual(jasmine.objectContaining({ 'tolerance': metrics_args.delays }));
      req.flush(metricsJson);
    });
  });
});
