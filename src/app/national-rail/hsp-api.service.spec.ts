import { ReflectiveInjector } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { Http,
  ConnectionBackend, XHRBackend,
  Response, ResponseOptions,
  Request, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import * as moment from 'moment';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { HspApiService } from './hsp-api.service';
import { ResourceService } from './resource.service';
import { JourneyDetails } from './hsp-details.model';
import { MetricsCollection } from './hsp-metrics.model';
import { MockResourceService} from './resource.service.mock';

const detailsJson = require('./resources/test-data/SD-201610037170624.json');
const metricsJson = require('./resources/test-data/SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json');

describe('HspApiService', () => {
  let backend: MockBackend;
  let service: HspApiService;

  // Note: we Mark function as async to ensure everything is resolved by the start
  beforeEach(async(() => {
    // Configure our test environment
    TestBed.configureTestingModule({
      providers: [
        HspApiService, // Unit under test
        MockBackend,
        BaseRequestOptions,
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
        },
        {
          deps: [
            MockBackend,
            BaseRequestOptions
          ],
          provide: Http,
          useFactory: (bkend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(bkend, defaultOptions);
          }
        }
      ]
    });

    // Grab hold of the mock backend so we can query the connections made
    backend = TestBed.get(MockBackend);
    backend.connections.subscribe((connection: any) => this.lastConnection = connection);

    // Create the unit under test
    service = TestBed.get(HspApiService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('journeyDetails makes correct request', () => {
    it('should request correct URL', () => {
      // Make the call
      const rid = 5;
      service.journeyDetails(rid);

      // Assert the requested URL
      expect(this.lastConnection).toBeDefined();
      expect(this.lastConnection.request.url).toMatch(/api\/hsp\/details/);
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'rid': rid.toString() }));
    });

    it('should return service details', () => {
      // Configure mock Http
      backend.connections.subscribe((connection: MockConnection) => {
        // Return mock service details
        connection.mockRespond(new Response(new ResponseOptions({
          body: detailsJson
        })));
      });

      // Test the serviceDetails function
      service.journeyDetails(0).subscribe((details: JourneyDetails) => {
        expect(details).toEqual(new JourneyDetails(detailsJson, TestBed.get(MockResourceService)));
      });
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
      // Make the call
      service.serviceMetrics(
        metrics_args.fromStation, metrics_args.toStation,
        moment(metrics_args.fromDate, 'YYYY-MM-DD'), moment(metrics_args.toDate, 'YYYY-MM-DD'),
        metrics_args.days, metrics_args.delays.map(x => moment.duration(x, 'minutes'))
      );

      // Assert the requested URL
      expect(this.lastConnection).toBeDefined();
      expect(this.lastConnection.request.url).toMatch(/api\/hsp\/metrics/);
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'from_loc': metrics_args.fromStation }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'to_loc': metrics_args.toStation }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'from_date': metrics_args.fromDate }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'to_date': metrics_args.toDate }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'from_time': '0000' }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'to_time': '2359' }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'days': metrics_args.days }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'tolerance': metrics_args.delays }));
    });

    it('should return service metrics', () => {
      // Configure mock Http
      backend.connections.subscribe((connection: MockConnection) => {
        // Return mock service details
        connection.mockRespond(new Response(new ResponseOptions({
          body: metricsJson
        })));
      });

      // Test the serviceMetrics function
      service.serviceMetrics(
        metrics_args.fromStation, metrics_args.toStation,
        moment(metrics_args.fromDate, 'YYYY-MM-DD'), moment(metrics_args.toDate, 'YYYY-MM-DD'),
        metrics_args.days, metrics_args.delays.map(x => moment.duration(x, 'minutes')))
      .subscribe((metrics: MetricsCollection) => {
        expect(metrics).toEqual(new MetricsCollection(metricsJson, TestBed.get(MockResourceService)));
      });
    });

    it('should not require tolerance', () => {
      // Make the call (without tolerance argument)
      service.serviceMetrics(
        metrics_args.fromStation, metrics_args.toStation,
        moment(metrics_args.fromDate, 'YYYY-MM-DD'), moment(metrics_args.toDate, 'YYYY-MM-DD'),
        metrics_args.days
      );

      // Assert the requested URL
      expect(this.lastConnection).toBeDefined();
      expect(this.lastConnection.request.url).toMatch(/api\/hsp\/metrics/);
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'from_loc': metrics_args.fromStation }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'to_loc': metrics_args.toStation }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'from_date': metrics_args.fromDate }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'to_date': metrics_args.toDate }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'from_time': '0000' }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'to_time': '2359' }));
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'days': metrics_args.days }));
      expect(this.lastConnection.request.json()).not.toEqual(jasmine.objectContaining({ 'tolerance': metrics_args.delays }));
    });
  });
});
