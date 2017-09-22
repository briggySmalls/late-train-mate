import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';

import * as moment from 'moment';
import * as assert from 'assert';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';

import { HspApiService } from './hsp-api.service';
import { MetricsCollection, ServiceMetrics, JourneyDetails } from './national_rail/hsp-types';
import { Journey, JourneyState } from './journey';


const CONCURRENT_COUNT = 3;
const PAGE_SIZE = 10;

enum State {
  RequestingMetrics,
  RequestingDetails,
  Error,
}

interface ISearch {
  fromStation: string;
  toStation: string;
  fromDate: moment.Moment;
  toDate: moment.Moment;
  days: string;
  delay: moment.Duration;
}

type IRequestFunc = () => void;

@Component({
  moduleId: module.id,
  selector: 'results-view',
  templateUrl: 'results.component.html',
  styleUrls: ['results.component.css'],
  providers: [HspApiService],
})
export class ResultsComponent implements OnInit {

  /**********************************************************************
  * Public Members
  *********************************************************************/

  /**
  * Field to make state type available in template
  */
  public stateEnum: typeof State = State;

  /**
  * Current state of the results component
  */
  public state = State.RequestingMetrics;

  /**
  * Bound field that controls whether to hide on-time journeys
  */
  public isHideTimely = true;

  /**********************************************************************
  * Private Members
  *********************************************************************/

  /**
  * The journeys that have been returned by a service metrics request
  */
  private journeys = new Array<Journey>();

  /**
  * The page of journeys being shown
  */
  private page = 0;

  /**
  * The journey that has been selected by the user
  */
  private selectedJourney: Journey = null;

  /**
  * The parameters of the search
  */
  public params: ISearch;

  /**********************************************************************
  * Static methods
  *********************************************************************/

  private static isDelayedState(state: JourneyState): boolean {
    return (state === JourneyState.Delayed) ||
    (state === JourneyState.Cancelled) ||
    (state === JourneyState.CancelledEnRoute);
  }

  /**
  * @brief      Determines if there were delays on the service.
  *
  * @param      service           The service
  * @param      delay             The delay
  * @param      toleranceMetrics  The tolerance metrics
  *
  * @return     True if delays on service, False otherwise.
  */
  private static isDelaysOnService(service: ServiceMetrics, delay: moment.Duration): boolean {
    return (service.metrics.First(
      toleranceMetrics => toleranceMetrics.tolerance.asMinutes() === delay.asMinutes()).numNotTolerance > 0);
  }

  private static pageCount(len: number) {
    // TODO: Floor
    return Math.floor(len / PAGE_SIZE);
  }

  /**
  * @brief      Compare function for sorting JourneyWrappers
  *
  * @param      a     First JourneyWrapper object
  * @param      b     Second JourneyWrapper object
  *
  * @return     Sort value
  */
  private static compare(a: Journey, b: Journey) {
    // First compare the date of departure from origin station
    let result = a.originDate.diff(b.originDate);

    // If both journeys departed on same date, use the departure time
    if (result === 0) {
      result = a.scheduledDeparture.diff(b.scheduledDeparture);
    }
    return result;
  }

  /**********************************************************************
  * Constructor
  *********************************************************************/

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private hspApiService: HspApiService) { }

  /**********************************************************************
  * View Methods
  *********************************************************************/

  public visibleJourneys(): Journey[] {
    return this.journeysOfInterest()
    .slice(this.page * PAGE_SIZE, (this.page + 1) * PAGE_SIZE);
  }

  public onToggleInterest(): void {
    this.isHideTimely = !this.isHideTimely;

    // Ensure that we never get stuck in an invalid page
    // TODO: Consider moving this to where we set isHideTimely?
    const pageCount = ResultsComponent.pageCount(this.journeysOfInterest().length);
    if (this.page > pageCount) {
      this.page = pageCount;
    }
  }

  public onNext(): void {
    if (this.page < ResultsComponent.pageCount(this.journeysOfInterest().length)) {
      this.page++;
    }
  }

  public onPrev(): void {
    if (this.page > 0) {
      this.page--;
    }
  }

  /**********************************************************************
  * Private methods
  *********************************************************************/

  ngOnInit(): void {
    // Listen for new params and call serviceMetrics, feeding the results to processMetrics
    this.route.params.switchMap((params: Params) => {
      // Save the search parameters
      this.params = {
        'fromStation': params['fromStation'],
        'toStation': params['toStation'],
        'fromDate': moment(params['fromDate'], 'YYYY-MM-DD'),
        'toDate': moment(params['toDate'], 'YYYY-MM-DD'),
        'days': params['days'],
        'delay': moment.duration(+params['delay'], 'minutes')
      };
      // Return the promise
      return this.hspApiService.serviceMetrics(
        this.params.fromStation,
        this.params.toStation,
        this.params.fromDate,
        this.params.toDate,
        this.params.days,
        [this.params.delay]);
    }).subscribe(metrics => {
      // Indicate the initial request is complete
      this.state = State.RequestingDetails;
      // Process the metrics
      this.processMetrics(metrics, this.params.delay);
    }, this.onError);
  }

  /**
  * @brief      Processes a new metrics collection, making further requests
  *             for the details of journeys on services with delays
  *
  * @param      metricsCollection  The metrics collection
  * @param      delay              The delay
  *
  * @return     NONE
  */
  private processMetrics(metricsCollection: MetricsCollection, delay: moment.Duration): void {
    assert.ok(metricsCollection.services.Count() > 0);

    // Create a fresh journeys array
    this.journeys = new Array<Journey>();
    // Create an array of request functions
    const furtherRequests = new Array<Observable<void>>();
    // TODO: Assert that the from/to stations match the request

    // Iterate over each service returned in the collection
    metricsCollection.services.ForEach(service => {
      console.log('Considering %s service', service.attributes.departureTime.format('HH:mm'));

      // Cycle through the journeys that ran on this service
      service.attributes.serviceIds.ForEach(serviceId => {

      // Create a new journey for the serviceId
      const journey = new Journey(
        serviceId,
        service.attributes.departureTime,
        service.attributes.arrivalTime,
        metricsCollection.fromStation,
        metricsCollection.toStation,
        service.attributes.originStation,
        service.attributes.destinationStation,
        delay);

        // Add the journey to the list
        this.journeys.push(journey);

        // Queue a request for details if metrics indicate delays on this service
        if (ResultsComponent.isDelaysOnService(service, delay)) {
          furtherRequests.push(journey.tryResolve(this.hspApiService));
        }
      });

      // Refresh the array reference to redraw view
      this.journeys = this.journeys.sort(ResultsComponent.compare);
    });

    // Now we have drawn the table, make the requests
    Observable.merge(...furtherRequests, CONCURRENT_COUNT).subscribe();
  }

  private journeysOfInterest(): Journey[] {
    return this.journeys.filter(journey =>
      (this.isHideTimely) ? ResultsComponent.isDelayedState(journey.state) : true
    );
  }

  private onError(error: any) {
    this.state = State.Error;
    console.log(error);

    // TODO: Cancel all requests
  }

  private onSelect(journey: Journey) {
    console.log('Selected ' + journey.details.serviceId);
    this.selectedJourney = journey;
  }
}
