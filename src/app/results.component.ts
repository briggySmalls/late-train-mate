import { Component, OnInit } from '@angular/core';
import { Http }      from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';

import * as moment from 'moment';

import { Observable }        from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { HspApiService }     from './hsp-api.service';
import { MetricsCollection, ServiceMetrics, JourneyDetails } from './national_rail/hsp-types';
import { Journey }    from './journey';


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

interface IRequestFunc {
    (): void;
}

@Component({
    moduleId: module.id,
    selector: 'results-view',
    templateUrl: 'results.component.html',
    styleUrls: ['results.component.css']
})
export class ResultsComponent implements OnInit {

    /**
     * Field to make state type available in template
     */
    private stateEnum: typeof State = State;
    /**
     * Current state of the results component
     */
    private state = State.RequestingMetrics;
    /**
     * Bound field that controls whether to hide on-time journeys
     */
    private isHideTimely = true;
    /**
     * The journeys that have been returned by a service metrics request
     */
    private journeys = new Array<Journey>();
    /**
     * The journey that has been selected by the user
     */
    private selectedJourney: Journey = null;
    /**
     * The parameters of the search
     */
    private params: ISearch;

    constructor(
        private http: Http,
        private route: ActivatedRoute,
        private hspApiService: HspApiService) { }

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
            }
            // Return the promise
            return this.hspApiService.serviceMetrics(
                this.params.fromStation,
                this.params.toStation,
                this.params.fromDate,
                this.params.toDate,
                this.params.days,
                [this.params.delay])
        }).subscribe(metrics => {
            // Indicate the initial request is complete
            this.state = State.RequestingDetails;
            // Process the metrics
            this.processMetrics(metrics, this.params.delay)
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
        // Create a fresh journeys array
        this.journeys = new Array<Journey>();
        // Create an array of request functions
        let furtherRequests = new Array<IRequestFunc>();
        // TODO: Assert that the from/to stations match the request

        // Iterate over each service returned in the collection
        metricsCollection.services.ForEach(service => {
            console.log("Considering %s service", service.departureTime.format("HH:mm"));

            // Cycle through the journeys that ran on this service
            service.serviceIds.ForEach(serviceId => {

                // Create a new journey for the serviceId
                let journey = new Journey(
                        serviceId,
                        metricsCollection.fromStation,
                        metricsCollection.toStation,
                        service.departureTime,
                        service.arrivalTime,
                        delay)

                // Add the journey to the list
                this.journeys.push(journey);

                // Queue a request for details if metrics indicate delays on this service
                if (ResultsComponent.isDelaysOnService(service, delay)) {
                    furtherRequests.push(() => journey.requestDetails(this.hspApiService)
                        .subscribe(
                            details => {},
                            this.onError));
                }
            })

            // Refresh the array reference to redraw view
            this.journeys = this.journeys.sort(ResultsComponent.compare);
        })

        // Now we have drawn the table, make the requests
        for (let request of furtherRequests) {
            request();
        }
    }

    /**
     * @brief      Processes new journey details, assessing impact for other journeys
     *
     * @param      journey  The journey
     *
     * @return     None
     */
    private processDetails(journey: Journey) {
        // Check if this journey provides an alternative route for a cancellation
        this.journeys
            .filter(x => x.isCancelled &&
                (journey.actualArrival.diff(x.scheduledArrival, 'minutes') < this.params.delay.asMinutes()))
            .forEach(cancelledJourney => {
                cancelledJourney.addAlternativeRoute(journey);
            })
    }

    private onSelect(journey: Journey) {
        console.log("Selected " + journey.details.serviceId);
        this.selectedJourney = journey;
    }

    private onError(error: any) {
        this.state = State.Error;
        console.log(error);

        // TODO: Cancel all requests
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
            toleranceMetrics => toleranceMetrics.tolerance.asMinutes() == delay.asMinutes()).numNotTolerance > 0);
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
        let result = a.date.diff(b.date);
        if (result == 0) {
            result = a.scheduledDeparture.diff(b.scheduledDeparture);
        }
        return result;
    }
}
