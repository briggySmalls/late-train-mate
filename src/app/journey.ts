import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { List } from 'linqts';

import { HspApiService } from './hsp-api.service';
import { JourneyDetails, StopDetails } from './national_rail/hsp-types';
import { Assert } from './assert';


export enum JourneyState {
    Unresolved,
    Requesting,
    OnTime,
    Delayed,
    Error,
}

export class Journey {
    public journeyStateEnum = JourneyState;

    public details: JourneyDetails;
    private fromStationDetails: StopDetails;
    private toStationDetails: StopDetails;
    private m_legs = new List<Leg>();
    public state = JourneyState.Unresolved;

    public constructor(private serviceId: number,
                       private fromStation: string,
                       private toStation: string,
                       public scheduledDeparture: moment.Moment,
                       public scheduledArrival: moment.Moment,
                       private delay: moment.Duration) {
        // Extract the date
        this.date = Journey.toDate(serviceId);

        // Create the first leg
        this.addLeg(
            serviceId,
            fromStation,
            toStation,
            scheduledDeparture.set({ 'day': this.date.day(), 'month': this.date.month(), 'year': this.date.year() }),
            scheduledArrival.set({ 'day': this.date.day(), 'month': this.date.month(), 'year': this.date.year() }),
            delay);
    }

    // Public Properties
    public date: moment.Moment;

    public get legs(): Leg[] { return this.m_legs.ToArray(); }

    public tryResolve(hspApiService: HspApiService): Observable<void> {
        // We should only attempt to resolve if unresolved
        Assert.areEqual(this.state, JourneyState.Unresolved);
        this.transition(JourneyState.Requesting);

        // We resolve the journey by getting the details of the last leg
        return this.m_legs.Last().requestDetails(hspApiService)
            .map(leg => {
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
                        // Raise request for later legs
                        this.transition(JourneyState.Unresolved);
                        break;

                    case LegState.CancelledEnRoute:
                        // Raise request for next leg
                        this.transition(JourneyState.Unresolved);
                        break;

                    default:
                        Assert.failUnexpectedDefault(leg.state);
                        break;
                }
            },
        )
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

    private addLeg(serviceId: number,
                   fromStation: string,
                   toStation: string,
                   scheduledDeparture: moment.Moment,
                   scheduledArrival: moment.Moment,
                   delay: moment.Duration): void {
        this.m_legs.Add(
            new Leg(
                    serviceId,
                    fromStation,
                    toStation,
                    scheduledDeparture,
                    scheduledArrival,
                    delay));
    }

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

    public constructor(private serviceId: number,
                private fromStation: string,
                private toStation: string,
                public scheduledDeparture: moment.Moment,
                public scheduledArrival: moment.Moment,
                private delay: moment.Duration) {
    }

    /**
     * @brief      Make an HSP API request for the details of the service
     *
     * @param      hspApiService  The hsp api service
     *
     * @return     Observable that emits the JourneyDetails obtained
     */
    public requestDetails(hspApiService: HspApiService): Observable<Leg> {
        // We should only permit requests if we are unpopulated (and not requesting)
        Assert.areEqual(this.state, LegState.Unpopulated);

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

        Assert.isTrue(Leg.getStop(this.details.stops, this.fromStation)
            .scheduledDeparture.isSame(this.scheduledDeparture));
        Assert.isTrue(Leg.getStop(this.details.stops, this.toStation)
            .scheduledArrival.isSame(this.scheduledArrival));

        // Update the delay status
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

    private get fromStationDetails(): Stop {
        return (this.details) ? new Stop(Leg.getStop(this.details.stops, this.fromStation)) : null;
    }

    private get toStationDetails(): Stop {
        return (this.details) ? new Stop(Leg.getStop(this.details.stops, this.toStation)) : null;
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

    private static getStop(stops: List<StopDetails>, stopName: string): StopDetails {
        return stops.First(x => x.station == stopName);
    }
}

class Stop {
    public constructor(private details: StopDetails) { }

    public get scheduledDeparture(): moment.Moment { return this.details.scheduledDeparture; }
    public get scheduledArrival(): moment.Moment { return this.details.scheduledArrival; }
    public get actualDeparture(): moment.Moment { return this.details.actualDeparture; }
    public get actualArrival(): moment.Moment { return this.details.actualArrival; }
    public get disruptionCode(): number { return this.details.disruptionCode; }

    private get departedOnTime(): boolean {
        return (this.details.scheduledDeparture) ?
            (this.details.actualDeparture && this.details.actualDeparture.isSame(this.details.scheduledDeparture)) :
            null;
    }

    private get arrivedOnTime(): boolean {
        return (this.details.scheduledArrival) ?
            (this.details.actualArrival && this.details.actualArrival.isSame(this.details.scheduledArrival)) :
            null;
    }
}
