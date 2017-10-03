import { List } from 'linqts';
import * as moment from 'moment';

import { ResourceService } from './resource.service';


// TODO: ServiceId, TocCode, Station be their own classes?
export type TimeOnly = moment.Moment;
export type DateOnly = moment.Moment;

/**
 * @brief      Base class for handling hsp api data.
 */
class HspApiData {
    /**
     * @brief      Parse a time string to a Date object
     *
     * @param      timeText  The time text
     *
     * @return     A Date object
     */
    protected toTime(timeText: string, date?: moment.Moment): moment.Moment {
      const time = moment(timeText, 'HHmm');
      if (date != null) {
        time.set({
          'day': date.day(),
          'month': date.month(),
          'year': date.year()
        });
      }
      return time;
    }

    /**
     * @brief      Parse a date string to a Date object
     *
     * @param      dateText  The date text
     *
     * @return     A Date object
     */
    protected toDate(dateText: string): moment.Moment {
        return moment(dateText, 'YYYY-M-DD');
    }
}

export interface IStation {
    display: string;
    value: string;
}

/* ----------------------------------------------------------------------------
 * Metrics Collection
 * --------------------------------------------------------------------------*/

export class MetricsCollection extends HspApiData {

    /**
     * @brief   The start station for which metrics were calculated
     */
    public fromStation: IStation;
    /**
     * @brief   The end station for which metrics were calculated
     */
    public toStation: IStation;
    /**
     * @brief   The collection of metrics per service
     */
    public services: List<ServiceMetrics>;

    constructor(private metricsData: any,
                private resourceService: ResourceService) {
        super();

        // Populate class from json data
        this.services = new List<ServiceMetrics>(metricsData['Services'].map(
            (serviceData: any) => new ServiceMetrics(serviceData, resourceService)));
        this.fromStation = this.resourceService.lookup(metricsData['header']['from_location']);
        this.toStation = this.resourceService.lookup(metricsData['header']['to_location']);
    }
}

export class ServiceMetrics extends HspApiData {

    public metrics: List<Metric>;
    public attributes: ServiceAttributes;

    constructor(serviceData: any,
                private resourceService: ResourceService) {
        super();

        // Populate class from json data
        this.attributes = new ServiceAttributes(
            serviceData['serviceAttributesMetrics'],
            resourceService);
        this.metrics = new List<Metric>(serviceData['Metrics'].map(
            (metricData: any) => new Metric(metricData, resourceService)));
    }
}

export class ServiceAttributes extends HspApiData {

    public originStation: IStation;
    public destinationStation: IStation;
    public departureTime: TimeOnly;
    public arrivalTime: TimeOnly;
    public tocCode: string;
    public serviceCount: number;
    public serviceIds: List<number>;

    constructor(attributesData: any,
                private resourceService: ResourceService) {
        super();

        // Populate class from json data
        this.originStation = this.resourceService.lookup(attributesData['origin_location']);
        this.destinationStation = this.resourceService.lookup(attributesData['destination_location']);
        this.departureTime = this.toTime(attributesData['gbtt_ptd']);
        this.arrivalTime = this.toTime(attributesData['gbtt_pta']);
        this.tocCode = attributesData['toc_code'];
        this.serviceCount = +attributesData['matched_services'];
        this.serviceIds = new List<number>(attributesData['rids'].map((rid: string) => +rid));
    }
}

export class Metric extends HspApiData {
  public tolerance: moment.Duration;
  public numNotTolerance: number;
  public numTolerance: number;
  public percentTolerance: number;
  public isGlobalTolerance: boolean;

  constructor(
    private metricData: any,
    private resourceService: ResourceService) {
      super();

      // Populate class from json data
      this.tolerance = moment.duration(+metricData['tolerance_value'], 'minutes');
      this.numNotTolerance = +metricData['num_not_tolerance'];
      this.numTolerance = +metricData['num_tolerance'];
      this.percentTolerance = +metricData['percent_tolerance'];
      this.isGlobalTolerance = metricData['global_tolerance'] === true;
  }
}

/* ----------------------------------------------------------------------------
* Journey Details
* --------------------------------------------------------------------------*/


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

  constructor(journeyData: any,
              private resourceService: ResourceService) {
      super();

      // Populate class from json data
      this.attributeDetails = journeyData['serviceAttributesDetails'];
      this.date = journeyData.toDate(this.attributeDetails['date_of_service']);
      this.tocCode = this.attributeDetails['toc_code'];
      this.serviceId = this.attributeDetails['rid'];

      // Get the first stop
      const originTime = this.toTime(
          this.attributeDetails['locations'][0]['gbtt_ptd'],
          this.date);

      // Map the JSON of stop details into a list of objects
      this.stops = new List<StopDetails>(
          this.attributeDetails['locations']
              .map((locationData: any) => new StopDetails(locationData,
                                                          this.date,
                                                          originTime,
                                                          resourceService)
              )
          );
  }
}

export class StopDetails extends HspApiData {
  public station: IStation;
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
      this.station = resourceService.lookup(stopData['location']);
      this.scheduledDeparture = stopData['gbtt_ptd'] ? this.dateFromTime(this.toTime(stopData['gbtt_ptd'], date), originTime) : null;
      this.scheduledArrival = stopData['gbtt_pta'] ? this.dateFromTime(this.toTime(stopData['gbtt_pta'], date), originTime) : null;
      this.actualDeparture = stopData['actual_td'] ? this.dateFromTime(this.toTime(stopData['actual_td'], date), originTime) : null;
      this.actualArrival = stopData['actual_ta'] ? this.dateFromTime(this.toTime(stopData['actual_ta'], date), originTime) : null;
      this.disruptionCode = stopData['late_canc_reason'] ? +stopData['late_canc_reason'] : null;
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


