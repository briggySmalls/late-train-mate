import { List } from 'linqts';
import * as moment from 'moment';

import { HspApiData, Station, TimeOnly, DateOnly } from './shared/hsp-core.model';
import { ResourceService } from './resource.service';


export class StopDetails extends HspApiData {
  public station: Station;
  public scheduledDeparture: moment.Moment;
  public scheduledArrival: moment.Moment;
  public actualDeparture: moment.Moment;
  public actualArrival: moment.Moment;
  public disruptionCode: number;

  constructor(stopData: any,
    date: DateOnly,
    originTime: moment.Moment,
    resourceService: ResourceService) {
    super();

    // Populate class from json data
    resourceService.lookupStation(stopData['location']).subscribe(station => { this.station = station; });
    this.scheduledDeparture = stopData['gbtt_ptd'] ? this.dateFromTime(this.toTime(stopData['gbtt_ptd'], date), originTime) : undefined;
    this.scheduledArrival = stopData['gbtt_pta'] ? this.dateFromTime(this.toTime(stopData['gbtt_pta'], date), originTime) : undefined;
    this.actualDeparture = stopData['actual_td'] ? this.dateFromTime(this.toTime(stopData['actual_td'], date), originTime) : undefined;
    this.actualArrival = stopData['actual_ta'] ? this.dateFromTime(this.toTime(stopData['actual_ta'], date), originTime) : undefined;
    this.disruptionCode = stopData['late_canc_reason'] ? +stopData['late_canc_reason'] : undefined;
  }

  private dateFromTime(time: TimeOnly, originTime: TimeOnly): moment.Moment {
    if (time) {
      // Handle times that occur other side of midnight
      if (time.diff(originTime) < 0) {
        time.add(1, 'days');
      }
    }
    return time;
  }
}

export class JourneyDetails extends HspApiData {

  private attributeDetails: any;

  /**
   * @brief      Date of the scheduled departure of the journey from the
   *             @TODO origin/from station?
   *
   */
  public date: DateOnly;
  public tocCode: String;
  public serviceId: number;
  public stops: List<StopDetails>;

  constructor(journeyData: any, resourceService: ResourceService) {
    super();

    // Populate class from json data
    const attributeDetails = journeyData['serviceAttributesDetails'];
    this.date = this.toDate(attributeDetails['date_of_service']);
    this.tocCode = attributeDetails['toc_code'];
    this.serviceId = +attributeDetails['rid'];

    // Get the first stop
    const originTime = this.toTime(
      attributeDetails['locations'][0]['gbtt_ptd'],
      this.date);

    // Map the JSON of stop details into a list of objects
    this.stops = new List<StopDetails>(
      attributeDetails['locations'].map((locationData: any) => new StopDetails(
        locationData,
        this.date,
        originTime,
        resourceService)
      )
    );
  }
}

