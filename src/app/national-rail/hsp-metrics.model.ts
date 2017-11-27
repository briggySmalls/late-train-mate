import { List } from 'linqts';
import * as moment from 'moment';

import { HspApiData, Station, TimeOnly, DateOnly } from './shared/hsp-core.model';
import { ResourceService } from './resource.service';


export class Metric extends HspApiData {
  public tolerance: moment.Duration;
  public numNotTolerance: number;
  public numTolerance: number;
  public percentTolerance: number;
  public isGlobalTolerance: boolean;

  constructor(
    metricData: any,
    resourceService: ResourceService) {
    super();

    // Populate class from json data
    this.tolerance = moment.duration(+metricData['tolerance_value'], 'minutes');
    this.numNotTolerance = +metricData['num_not_tolerance'];
    this.numTolerance = +metricData['num_tolerance'];
    this.percentTolerance = +metricData['percent_tolerance'];
    this.isGlobalTolerance = metricData['global_tolerance'] === true;
  }
}

export class ServiceMetrics extends HspApiData {

  public originStation: Station;
  public destinationStation: Station;
  public departureTime: TimeOnly;
  public arrivalTime: TimeOnly;
  public tocCode: string;
  public serviceCount: number;
  public serviceIds: List<number>;
  public metrics: List<Metric>;

  constructor(serviceData: any,
    resourceService: ResourceService) {
    super();

    // Populate class from json data
    resourceService
      .lookupStation(serviceData['serviceAttributesMetrics']['origin_location'])
      .subscribe(station => { this.originStation = station; });
    resourceService
      .lookupStation(serviceData['serviceAttributesMetrics']['destination_location'])
      .subscribe(station => { this.destinationStation = station; });
    this.departureTime = this.toTime(serviceData['serviceAttributesMetrics']['gbtt_ptd']);
    this.arrivalTime = this.toTime(serviceData['serviceAttributesMetrics']['gbtt_pta']);
    this.tocCode = serviceData['serviceAttributesMetrics']['toc_code'];
    this.serviceCount = +serviceData['serviceAttributesMetrics']['matched_services'];
    this.serviceIds = new List<number>(serviceData['serviceAttributesMetrics']['rids'].map((rid: string) => +rid));
    this.metrics = new List<Metric>(serviceData['Metrics'].map(
      (metricData: any) => new Metric(metricData, resourceService)));
  }
}

export class MetricsCollection extends HspApiData {

    /**
     * @brief   The start station for which metrics were calculated
     */
    public fromStation: Station;
    /**
     * @brief   The end station for which metrics were calculated
     */
    public toStation: Station;
    /**
     * @brief   The collection of metrics per service
     */
    public services: List<ServiceMetrics>;

    constructor(metricsData: any,
                resourceService: ResourceService) {
        super();

        // Populate class from json data
        this.services = new List<ServiceMetrics>(metricsData['Services'].map(
            (serviceData: any) => new ServiceMetrics(serviceData, resourceService)));
        resourceService.lookupStation(metricsData['header']['from_location']).subscribe(station => { this.fromStation = station; });
        resourceService.lookupStation(metricsData['header']['to_location']).subscribe(station => { this.toStation = station; });
    }
}
