import { ReflectiveInjector } from '@angular/core';
import { async, fakeAsync, tick } from '@angular/core/testing';
import { Http, ConnectionBackend, Response, ResponseOptions, Request, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { HspApiService } from './hsp-api.service';
import { ResourceService } from './resource.service';
import { JourneyDetails } from './hsp-details.model';
import { MetricsCollection } from './hsp-metrics.model';

const detailsJson = require('./resources/test-data/SD-201610037170624.json');
const metricsJson = require('./resources/test-data/SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json');

describe('HspApiService', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http,
      HspApiService,
      ResourceService
    ]);
    this.hspApiService = this.injector.get(HspApiService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  it('should be created', () => {
    expect(this.backend).toBeTruthy();
  });

  describe('journeyDetails makes correct request', () => {
    it('should request correct URL', () => {
      // Make the call
      const rid = 5;
      this.hspApiService.journeyDetails(rid);

      // Assert the requested URL
      expect(this.lastConnection).toBeDefined();
      expect(this.lastConnection.request.url).toMatch(/api\/hsp\/details/);
      expect(this.lastConnection.request.json()).toEqual(jasmine.objectContaining({ 'rid': rid.toString() }));
    });

    it('should return service details', () => {
      // Configure mock Http
      this.backend.connections.subscribe((connection: MockConnection) => {
        // Return mock service details
        connection.mockRespond(new Response(new ResponseOptions({
          body: detailsJson
        })));
      });

      // Test the serviceDetails function
      this.hspApiService.journeyDetails(0).subscribe((details: JourneyDetails) => {
        expect(details).toEqual(new JourneyDetails(detailsJson, this.injector.get(ResourceService)));
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
      this.hspApiService.serviceMetrics(
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
      this.backend.connections.subscribe((connection: MockConnection) => {
        // Return mock service details
        connection.mockRespond(new Response(new ResponseOptions({
          body: metricsJson
        })));
      });

      // Test the serviceDetails function
      this.hspApiService.serviceMetrics(
        metrics_args.fromStation, metrics_args.toStation,
        moment(metrics_args.fromDate, 'YYYY-MM-DD'), moment(metrics_args.toDate, 'YYYY-MM-DD'),
        metrics_args.days, metrics_args.delays.map(x => moment.duration(x, 'minutes')))
      .subscribe((metrics: MetricsCollection) => {
        expect(metrics).toEqual(new MetricsCollection(metricsJson, this.injector.get(ResourceService)));
      });
    });
  });
});
