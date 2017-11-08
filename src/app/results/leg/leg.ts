import * as moment from 'moment';
import * as assert from 'assert';
import { Observable } from 'rxjs/Observable';

import { JourneyDetails, StopDetails, Station, HspApiService } from '../../national-rail';

export enum LegState {
  Unpopulated,
  Requesting,
  OnTime,
  Delayed,
  Cancelled,
  CancelledEnRoute,
  Error,
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
      undefined;
  }

  public get arrivedOnTime(): boolean {
    return (this.details.scheduledArrival) ?
      (this.details.actualArrival && this.details.actualArrival.isSame(this.details.scheduledArrival)) :
      undefined;
  }
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
    public fromStation: Station,
    public toStation: Station,
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


  public get actualDeparture(): moment.Moment { return (this.fromStationDetails) ? this.fromStationDetails.actualDeparture : undefined; }

  public get actualArrival(): moment.Moment { return (this.toStationDetails) ? this.toStationDetails.actualArrival : undefined; }

  public get disruptionCode(): number { return (this.toStationDetails) ? this.toStationDetails.disruptionCode : undefined; }

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
    assert.equal(this.fromStationDetails.scheduledDeparture.minute(), this.scheduledDeparture.minute());
    assert.equal(this.fromStationDetails.scheduledDeparture.hour(), this.scheduledDeparture.hour());
    assert.equal(this.toStationDetails.scheduledArrival.minute(), this.scheduledArrival.minute());
    assert.equal(this.toStationDetails.scheduledArrival.hour(), this.scheduledArrival.hour());

    // Update our scheduled departure/arrival
    this.scheduledDeparture = this.fromStationDetails.scheduledDeparture;
    this.scheduledArrival = this.toStationDetails.scheduledArrival;

    // Update the delay status based upon the results
    if (this.actualArrival === undefined) {
      if (this.actualDeparture === undefined) {
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

  private getStop(station: Station): StopDetails {
    return this.details.stops.First(x => x.station === station);
  }
}
