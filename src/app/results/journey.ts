import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { List } from 'linqts';
import * as assert from 'assert';

import { HspApiService } from '../national-rail/hsp-api.service';
import { JourneyDetails, StopDetails, IStation } from '../national-rail/hsp-types';
import { Leg, LegState } from './leg/leg';


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
        if (leg === this.m_legs.First()) {
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
}
