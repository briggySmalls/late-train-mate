import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { HspApiService } from './hsp-api.service';
import { JourneyDetails, StopDetails } from './national_rail/hsp-types';


enum RequestState {
    Unpopulated,
    Requesting,
    Populated,
    Error,
}

enum DelayStatus {
    Unknown,
    OnTime,
    Delayed,
    Cancelled,
}

export class Journey {
    public requestStateEnum = RequestState;
    public delayStatusEnum = DelayStatus;

    public requestState = RequestState.Unpopulated;
    public delayStatus = DelayStatus.Unknown;

    public details: JourneyDetails;
    private fromStationDetails: StopDetails;
    private toStationDetails: StopDetails;
    private routes = new Array<Journey>();

    constructor(private serviceId: number,
                private fromStation: string,
                private toStation: string,
                public scheduledDeparture: moment.Moment,
                public scheduledArrival: moment.Moment,
                private delay: moment.Duration) {
        this.date = moment(this.serviceId.toString().slice(0, 8), 'YYYYMMDD');
        this.transition(RequestState.Unpopulated);
    }sc

    // Public Properties
    public date: moment.Moment;
    public get actualArrival(): moment.Moment { return (this.toStationDetails) ? this.toStationDetails.actualArrival : null; }
    public get disruptionCode(): number { return (this.toStationDetails) ? this.toStationDetails.disruptionCode : null; }
    public get isCancelled(): boolean { return (this.delayStatus == DelayStatus.Cancelled); }
    public get stops(): Array<StopDetails> { return (this.details) ? this.details.stops.ToArray() : null; }

    // Public Methods
    public requestDetails(hspApiService: HspApiService): Observable<JourneyDetails> {
        // Update the state to show we have begun a request
        this.transition(RequestState.Requesting);

        // Make the request and configure how the response should be handled
        return hspApiService.journeyDetails(this.serviceId)
            .map(
                details => {
                    // Record the journey details
                    this.recordDetails(details);
                    // Output the details to the caller's Observable
                    return details;
                },
                error => { });
    }

    /**
     * @brief      Adds an alternative route for arriving at the destination in time.
     *
     * @param      journey  The journey
     *
     * @return     None
     */
    public addAlternativeRoute(journey: Journey) {
        this.routes.push(journey);
    }

    /**
     * @brief      Record the details of a journey
     *
     * @param      details  The details
     *
     * @return     None
     */
    private recordDetails(details: JourneyDetails): void {
        // Update the details
        this.details = details;

        // TOOD: Assert that scheduledArrival, scheduledDeparture and DATE are correct

        // Assign the first station matching fromStation text
        this.fromStationDetails = details.stops.First(
            (x: StopDetails) => x.station == this.fromStation);

        // Assign the first station matching toStation text
        this.toStationDetails = details.stops.First(
            (x: StopDetails) => x.station == this.toStation);

        // Update the request state
        this.transition(RequestState.Populated);

        // Update the delay status
        if (this.actualArrival == null) {
            // Journey was cancelled/brokedown
            this.delayStatus = DelayStatus.Cancelled;
        } else if (this.actualArrival.diff(this.scheduledArrival, 'minutes') > this.delay.asMinutes()) {
            // Journey arrived late
            this.delayStatus = DelayStatus.Delayed;
        } else {
            // Journey arrived on time
            this.delayStatus = DelayStatus.OnTime;
        }
    }

    private onError(error: any) {
        this.transition(RequestState.Error);
    }

    private get requestClass(): string {
        let className = '';
        // Update the class based upon the new state
        switch (this.requestState)
        {
            case RequestState.Populated:
                className = 'populated';
                break;

            case RequestState.Requesting:
                className = 'requesting';
                break;

            case RequestState.Unpopulated:
                className = 'unpopulated';
                break;

            case RequestState.Error:
                className = 'error';
                break;

            default:
                console.log('Unexpected RequestState: ' + this.requestState);
                break;
        }
        return className;
    };

    private get delayClass(): string {
        let className = '';
        switch (this.delayStatus)
        {
            case DelayStatus.Unknown:
                // We do not know what the status is yet
                break;

            case DelayStatus.Cancelled:
                className = 'cancelled';
                break;

            case DelayStatus.Delayed:
                className = 'delayed';
                break;

            case DelayStatus.OnTime:
                className = 'on-time';
                break;

            default:
                console.log("Unexpected status: " + this.delayStatus);
                break;

        }
        return className;
    }

    // Private Properties
    private get isPopulated(): boolean { return (this.requestState == RequestState.Populated); }

    // Private methods
    private transition(newRequestState: RequestState): void {
        // Update the state
        this.requestState = newRequestState;
    }
}
