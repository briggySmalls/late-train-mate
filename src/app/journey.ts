import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { List } from 'linqts';
import * as assert from 'assert';

import { HspApiService } from './hsp-api.service';
import { JourneyDetails, StopDetails, IStation } from './national_rail/hsp-types';


export enum JourneyState {
    Unresolved,
    Requesting,
    OnTime,
    Delayed,
    Error,
    Cancelled,
    CancelledEnRoute,
}

export class Journey {

    /**********************************************************************
     * Private Members
     *********************************************************************/

    public journeyStateEnum = JourneyState;
    public details: JourneyDetails;
    public state = JourneyState.Unresolved;

    private fromStationDetails: StopDetails;
    private toStationDetails: StopDetails;
    private m_legs = new List<Leg>();
    private m_originDate: moment.Moment;

    /**********************************************************************
     * Constructor
     *********************************************************************/

    public constructor(private serviceId: number,
                       private m_scheduledDeparture: moment.Moment,
                       private m_scheduledArrival: moment.Moment,
                       private m_fromStation: IStation,
                       private m_toStation: IStation,
                       private m_originStation: IStation,
                       private m_terminatingStation: IStation,
                       private delay: moment.Duration) {

        // Squeeze the date out of the RID for sorting purposes
        this.m_originDate = Journey.toDate(serviceId);

        // Create the first leg
        this.m_legs.Add(new Leg(
            serviceId,
            m_fromStation,
            m_toStation,
            m_scheduledDeparture,
            m_scheduledArrival,
            delay));
    }

    /**********************************************************************
     * Public Properties
     *********************************************************************/

    public get scheduledArrival(): moment.Moment { return this.m_scheduledArrival; }
    public get scheduledDeparture(): moment.Moment { return this.m_scheduledDeparture; }


    public get fromStation(): IStation { return this.m_fromStation; }
    public get toStation(): IStation { return this.m_toStation; }
    public get originStation(): IStation { return this.m_originStation; }
    public get terminatingStation(): IStation { return this.m_terminatingStation; }

    public get legs(): Leg[] { return this.m_legs.ToArray(); }

    public get originDate(): moment.Moment {
        return this.m_originDate;
    }

    public get actualArrival(): moment.Moment {
        return this.m_legs.Last().actualArrival;
    }

    public get stateClass(): string {
        let className: string;
        switch (this.state) {
            case JourneyState.Delayed:
                className = 'delayed';
                break;

            case JourneyState.OnTime:
                className = 'on-time';
                break;

            case JourneyState.Cancelled:
                className = 'cancelled';
                break;

            case JourneyState.CancelledEnRoute:
                className = 'cancelled-en-route';
                break;

            case JourneyState.Requesting:
                className = 'requesting';
                break;

            case JourneyState.Unresolved:
                className = 'unresolved';
                break;

            case JourneyState.Error:
                className = 'error';
                break;
        }
        return className;
    }

    /**********************************************************************
     * Public Methods
     *********************************************************************/

    public tryResolve(hspApiService: HspApiService): Observable<void> {
        // We should only attempt to resolve if unresolved
        assert.equal(this.state, JourneyState.Unresolved);
        this.transition(JourneyState.Requesting);

        // We resolve the journey by getting the details of the last leg
        return this.m_legs.Last().requestDetails(hspApiService)
            .map(leg => {
                // Update times with known dates
                if (leg == this.m_legs.First()) {
                    console.log('Updating scheduled times');
                    this.m_scheduledArrival = leg.scheduledArrival;
                    this.m_scheduledDeparture = leg.scheduledDeparture;
                }

                switch (leg.state) {
                    case LegState.OnTime:
                    case LegState.Delayed:
                        // Do nothing, we are resolved!
                        if (leg.actualArrival.diff(this.scheduledArrival, 'minutes') > this.delay.asMinutes()) {
                            // Definition of delayed is actual arrival later than scheduled by specified delay
                            this.transition(JourneyState.Delayed);
                        } else {
                            // Otherwise we're on time!
                            this.transition(JourneyState.OnTime);
                        }
                        break;

                    case LegState.Cancelled:
                        // TODO: Raise request for later legs
                        this.transition(JourneyState.Cancelled);
                        break;

                    case LegState.CancelledEnRoute:
                        // TODO: Raise request for next leg
                        this.transition(JourneyState.CancelledEnRoute);
                        break;

                    default:
                        assert.fail(undefined, undefined, `Unexpected default state: ${leg.state}`);
                        break;
                }
            },
        );
    }

    /**********************************************************************
     * Private Methods
     *********************************************************************/


    private transition(newState: JourneyState): void {
        this.state = newState;
    }

    /**
     * @brief      Helper function to convert a service ID to a date
     *
     * @param      serviceId  The service identifier
     *
     * @return     Moment that captures a date
     */
    private static toDate(serviceId: number): moment.Moment {
        return moment(serviceId.toString().slice(0, 8), 'YYYYMMDD');
    }
}

enum LegState {
    Unpopulated,
    Requesting,
    OnTime,
    Delayed,
    Cancelled,
    CancelledEnRoute,
    Error,
}

export class Leg {
    public legStateEnum = LegState;

    public state = LegState.Unpopulated;
    public details: JourneyDetails;

    private m_fromStationDetails: Stop;
    private m_toStationDetails: Stop;

    /**********************************************************************
     * Constructor
     *********************************************************************/

    public constructor(private serviceId: number,
                public fromStation: IStation,
                public toStation: IStation,
                public scheduledDeparture: moment.Moment,
                public scheduledArrival: moment.Moment,
                private delay: moment.Duration) {
    }

    /**********************************************************************
     * Public Methods
     *********************************************************************/

    /**
     * @brief      Make an HSP API request for the details of the service
     *
     * @param      hspApiService  The hsp api service
     *
     * @return     Observable that emits the JourneyDetails obtained
     */
    public requestDetails(hspApiService: HspApiService): Observable<Leg> {
        // We should only permit requests if we are unpopulated (and not requesting)
        assert.equal(this.state, LegState.Unpopulated);

        // Update the state to show we have begun a request
        this.transition(LegState.Requesting);

        // Make the request and configure how the response should be handled
        return hspApiService.journeyDetails(this.serviceId)
            .map(
                details => {
                    // Record the journey details
                    this.recordDetails(details);
                    // Output the details to the caller's Observable
                    return this;
                },
                this.onError);
    }

    /**********************************************************************
     * Public Properties
     *********************************************************************/


    public get actualDeparture(): moment.Moment { return (this.fromStationDetails) ? this.fromStationDetails.actualDeparture : null; }

    public get actualArrival(): moment.Moment { return (this.toStationDetails) ? this.toStationDetails.actualArrival : null; }

    public get disruptionCode(): number { return (this.toStationDetails) ? this.toStationDetails.disruptionCode : null; }

    public get stateClass(): string {
        let className: string;
        switch (this.state) {
            case LegState.Unpopulated:
                className = 'unpopulated';
                break;

            case LegState.Requesting:
                className = 'requesting';
                break;

            case LegState.OnTime:
                className = 'on-time';
                break;

            case LegState.Delayed:
                className = 'delayed';
                break;

            case LegState.Cancelled:
                className = 'cancelled';
                break;

            case LegState.CancelledEnRoute:
                className = 'cancelled-en-route';
                break;

            case LegState.Error:
                className = 'error';
                break;
        }
        return className;
    }

    /**********************************************************************
     * Private Properties
     *********************************************************************/

    public get fromStationDetails(): Stop { return this.m_fromStationDetails; }
    public get toStationDetails(): Stop { return this.m_toStationDetails; }

    /**********************************************************************
     * Private Methods
     *********************************************************************/

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

        // Update our from/to stations
        this.m_fromStationDetails = new Stop(this.getStop(this.fromStation));
        this.m_toStationDetails = new Stop(this.getStop(this.toStation));
        // Assert that our scheduled times match up with the details
        assert.equal(this.fromStationDetails.scheduledDeparture.minutes, this.scheduledDeparture.minutes);
        assert.equal(this.fromStationDetails.scheduledDeparture.hours, this.scheduledDeparture.hours);
        assert.equal(this.toStationDetails.scheduledArrival.minutes, this.scheduledArrival.minutes);
        assert.equal(this.toStationDetails.scheduledArrival.hours, this.scheduledArrival.hours);

        // Update our scheduled departure/arrival
        this.scheduledDeparture = this.fromStationDetails.scheduledDeparture;
        this.scheduledArrival = this.toStationDetails.scheduledArrival;

        // Update the delay status based upon the results
        if (this.actualArrival == null) {
            if (this.actualDeparture == null) {
                // Journey was cancelled before arrival
                this.transition(LegState.Cancelled);
            } else {
                // Journey was cancelled en-route
                this.transition(LegState.CancelledEnRoute);
            }
        } else if (this.actualArrival.diff(this.scheduledArrival, 'minutes') > this.delay.asMinutes()) {
            // Journey arrived late
            this.transition(LegState.Delayed);
        } else {
            // Journey arrived on time
            this.transition(LegState.OnTime);
        }
    }

    private onError(error: any) {
        this.transition(LegState.Error);
    }

    /**
     * @brief      Transition to a new state
     *
     * @param      newState  The new state
     *
     * @return     None
     */
    private transition(newState: LegState): void {
        // Update the state
        this.state = newState;
    }

    private getStop(station: IStation): StopDetails {
        return this.details.stops.First(x => x.station == station);
    }
}

class Stop {
    public constructor(private details: StopDetails) { }

    public get scheduledDeparture(): moment.Moment { return this.details.scheduledDeparture; }
    public get scheduledArrival(): moment.Moment { return this.details.scheduledArrival; }
    public get actualDeparture(): moment.Moment { return this.details.actualDeparture; }
    public get actualArrival(): moment.Moment { return this.details.actualArrival; }
    public get disruptionCode(): number { return this.details.disruptionCode; }

    public get departedOnTime(): boolean {
        return (this.details.scheduledDeparture) ?
            (this.details.actualDeparture && this.details.actualDeparture.isSame(this.details.scheduledDeparture)) :
            null;
    }

    public get arrivedOnTime(): boolean {
        return (this.details.scheduledArrival) ?
            (this.details.actualArrival && this.details.actualArrival.isSame(this.details.scheduledArrival)) :
            null;
    }
}
