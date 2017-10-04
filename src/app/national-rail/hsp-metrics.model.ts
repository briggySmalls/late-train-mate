import { List } from 'linqts';
import * as moment from 'moment';

import { HspApiData, IStation, TimeOnly, DateOnly } from './shared/hsp-core.model';
import { ResourceService } from './resource.service';

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

  public originStation: IStation;
  public destinationStation: IStation;
  public departureTime: TimeOnly;
  public arrivalTime: TimeOnly;
  public tocCode: string;
  public serviceCount: number;
  public serviceIds: List<number>;
  public metrics: List<Metric>;

  constructor(serviceData: any,
              private resourceService: ResourceService) {
    super();

    // Populate class from json data
    this.originStation = this.resourceService.lookup(serviceData['serviceAttributesMetrics']['origin_location']);
    this.destinationStation = this.resourceService.lookup(serviceData['serviceAttributesMetrics']['destination_location']);
    this.departureTime = this.toTime(serviceData['serviceAttributesMetrics']['gbtt_ptd']);
    this.arrivalTime = this.toTime(serviceData['serviceAttributesMetrics']['gbtt_pta']);
    this.tocCode = serviceData['serviceAttributesMetrics']['toc_code'];
    this.serviceCount = +serviceData['serviceAttributesMetrics']['matched_services'];
    this.serviceIds = new List<number>(serviceData['serviceAttributesMetrics']['rids'].map((rid: string) => +rid));
    this.metrics = new List<Metric>(serviceData['Metrics'].map(
        (metricData: any) => new Metric(metricData, resourceService)));
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
