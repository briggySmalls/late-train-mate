import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';
import * as assert from 'assert';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';

import { HspApiService, MetricsCollection, ServiceMetrics, JourneyDetails } from '../national-rail';
import { Journey, JourneyState } from './journey';


const CONCURRENT_COUNT = 3;

enum State {
  RequestingMetrics,
  RequestingDetails,
  Complete,
  Error,
}

interface ISearch {
  fromStation: string;
  toStation: string;
  fromDate: moment.Moment;
  toDate: moment.Moment;
  days: string;
}

type IRequestFunc = () => void;

@Component({
  moduleId: module.id,
  selector: 'late-mate-results-view',
  templateUrl: 'results.component.html',
  styleUrls: ['results.component.scss'],
  providers: [HspApiService],
})
export class ResultsComponent implements OnInit {

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

  /**
   * Percentage for the progress bar
   */
  public progressValue = 0;

  /**
   * The size of a page (for pagination)
   */
  public readonly pageSize = 10;

  /**
  * The journeys that have been returned by a service metrics request
  */
  private journeys = new Array<Journey>();

  /**
  * The page of journeys being shown
  */
  public current_page = 0;

  /**
  * The journey that has been selected by the user
  */
  private selectedJourney: Journey;

  /**
  * The parameters of the search
  */
  public params: ISearch;

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

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private hspApiService: HspApiService) { }

  /**
   * Function to get the current paginated journey list
   */
  public visibleJourneys(): Journey[] {
    return this.journeysOfInterest()
      .slice(this.current_page * this.pageSize, (this.current_page + 1) * this.pageSize);
  }

  public onToggleInterest(): void {
    this.isHideTimely = !this.isHideTimely;

    // Ensure that we never get stuck in an invalid page
    const pageCount = Math.floor(this.journeysOfInterest().length / this.pageSize);
    if (this.current_page > pageCount) {
      this.current_page = pageCount;
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
        'days': params['days']
      };
      // Return the promise
      return this.hspApiService.serviceMetrics(
        this.params.fromStation,
        this.params.toStation,
        this.params.fromDate,
        this.params.toDate,
        this.params.days);
    }).subscribe(metrics => {
      if (metrics.services.Count() > 0) {
        // Indicate the initial request is complete
        this.state = State.RequestingDetails;
        // Process the metrics
        this.processMetrics(metrics, moment.duration(0));
      } else {
        // Indicate that we are done
        this.state = State.Complete;
      }
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
      console.log('Considering %s service', service.departureTime.format('HH:mm'));

      // Cycle through the journeys that ran on this service
      service.serviceIds.ForEach(serviceId => {

      // Create a new journey for the serviceId
      const journey = new Journey(
        serviceId,
        service.departureTime,
        service.arrivalTime,
        metricsCollection.fromStation,
        metricsCollection.toStation,
        service.originStation,
        service.destinationStation,
        delay);

        // Add the journey to the list
        this.journeys.push(journey);

        // Queue a request for details if metrics indicate delays on this service
        if (ResultsComponent.isDelaysOnService(service, delay)) {
          furtherRequests.push(journey.tryResolve(this.hspApiService));
        }
      });
    });

    // Now we have all the journeys, sort them
    this.journeys = this.journeys.sort(ResultsComponent.compare);
    // Finally, make the requests for further details
    Observable.merge(...furtherRequests, CONCURRENT_COUNT).subscribe(
      () => this.progressValue = this.progressValue + 100 / furtherRequests.length,
      undefined,
      () => this.state = State.Complete, // Indicate all requests are complete
    );
  }

  private journeysOfInterest(): Journey[] {
    return this.journeys.filter(journey =>
      (this.isHideTimely) ? ResultsComponent.isDelayedState(journey.state) : true
    );
  }

  private onError(error: any) {
    this.state = State.Error;
    console.log(error);

    console.log('TODO: Cancel all requests');
  }

  private onSelect(journey: Journey) {
    console.log('Selected ' + journey.details.serviceId);
    this.selectedJourney = journey;
  }
}
