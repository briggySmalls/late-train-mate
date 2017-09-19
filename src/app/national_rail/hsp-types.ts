import { List } from 'linqts';
import * as moment from 'moment';

import { ResourceService } from './resource.service';


// TODO: ServiceId, TocCode, Station be their own classes?
export type TimeOnly = moment.Moment;
export type DateOnly = moment.Moment;

/**
 * @brief      Base class for handling hsp api data.
 */
export class HspApiData {
    constructor(private jsonData: any) { }

    protected get data(): any { return this.jsonData; }

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

    private m_services: List<ServiceMetrics>;
    private m_fromStation: IStation;
    private m_toStation: IStation;

    constructor(private metricsData: any,
                private resourceService: ResourceService) {
        super(metricsData);

        this.m_services = new List<ServiceMetrics>(this.data['Services'].map(
            (serviceData: any) => new ServiceMetrics(serviceData, resourceService)));

        this.m_fromStation = this.resourceService.lookup(this.data['header']['from_location']);
        this.m_toStation = this.resourceService.lookup(this.data['header']['to_location']);
    }

    /**
     * @brief      The start station for which metrics were calculated
     *
     * @return     A station TLA
     */
    public get fromStation(): IStation { return this.m_fromStation; }

    /**
     * @brief      The end station for which metrics were calculated
     *
     * @return     A station TLA
     */
    public get toStation(): IStation { return this.m_toStation; }

    public get services(): List<ServiceMetrics> { return this.m_services; }
}

export class ServiceMetrics extends HspApiData {

    private m_metrics: List<Metric>;
    private m_attributes: ServiceAttributes;

    constructor(private serviceData: any,
                private resourceService: ResourceService) {
        super(serviceData);

        this.m_attributes = new ServiceAttributes(
            this.data['serviceAttributesMetrics'],
            resourceService);

        this.m_metrics = new List<Metric>(this.data['Metrics'].map(
            (metricData: any) => new Metric(metricData)));
    }

    public get metrics(): List<Metric> { return this.m_metrics; }

    public get attributes(): ServiceAttributes { return this.m_attributes; };
}

export class ServiceAttributes extends HspApiData {

    private m_originStation: IStation;
    private m_destinationStation: IStation;

    constructor(private attributesData: any,
                private resourceService: ResourceService) {
        super(attributesData);

        this.m_originStation = this.resourceService.lookup(this.data['origin_location']);
        this.m_destinationStation = this.resourceService.lookup(this.data['destination_location']);
    }

    public get departureTime(): TimeOnly {
        return this.toTime(this.data['gbtt_ptd']);
    };

    public get arrivalTime(): TimeOnly {
        return this.toTime(this.data['gbtt_pta']);
    }

    public get originStation(): IStation {
        return this.data['origin_location'];
    }

    public get destinationStation(): IStation {
        return this.data['destination_location'];
    }

    public get tocCode(): string {
        return this.data['toc_code'];
    }

    public get serviceCount(): number {
        return this.data['matched_services'];
    }

    public get serviceIds(): List<number> {
        return new List<number>(this.data['rids']);
    }
}

export class Metric extends HspApiData {
    public get tolerance(): moment.Duration {
        return moment.duration(+this.data['tolerance_value'], 'minutes');
    }

    public get numNotTolerance(): number {
        return +this.data['num_not_tolerance'];
    }

    public get numTolerance(): number {
        return +this.data['num_tolerance'];
    }

    public percentTolerance(): number {
        return +this.data['percent_to_tolerance'];
    }

    public isGlobalTolerance(): boolean {
        return (this.data['global_tolerance'] === 'true');
    }
}

/* ----------------------------------------------------------------------------
 * Journey Details
 * --------------------------------------------------------------------------*/


export class JourneyDetails extends HspApiData {

    private m_stops: List<StopDetails>;

    constructor(private journeyData: any,
                private resourceService: ResourceService) {
        super(journeyData);

        // Get the first stop
        const originTime = this.toTime(
            this.attributeDetails['locations'][0]['gbtt_ptd'],
            this.date);

        // Map the JSON of stop details into a list of objects
        this.m_stops = new List<StopDetails>(
            this.attributeDetails['locations']
                .map((locationData: any) => new StopDetails(locationData,
                                                            this.date,
                                                            originTime,
                                                            resourceService)
                )
            );
    }

    /**
     * @brief      Date of the scheduled departure of the journey from the
     *             @TODO origin/from station?
     *
     */
    public get date(): DateOnly {
        return this.toDate(this.attributeDetails['date_of_service']);
    }

    public get tocCode(): String {
        return this.attributeDetails['toc_code'];
    }

    public get serviceId(): number {
        return this.attributeDetails['rid'];
    }

    public get stops(): List<StopDetails> {
        return this.m_stops;
    }

    private get attributeDetails(): any {
        return this.data['serviceAttributesDetails'];
    }
}

export class StopDetails extends HspApiData {

    constructor(private stopData: any,
                private date: DateOnly,
                private originTime: moment.Moment,
                private resourceService: ResourceService) {
        super(stopData);
    }

    public get station(): IStation {
        return this.resourceService.lookup(this.data['location']);
    }

    public get scheduledDeparture(): moment.Moment {
        return this.data['gbtt_ptd'] ? this.dateFromTime(this.toTime(this.data['gbtt_ptd'], this.date)) : null;
    }

    public get scheduledArrival(): moment.Moment {
        return this.data['gbtt_pta'] ? this.dateFromTime(this.toTime(this.data['gbtt_pta'], this.date)) : null;
    }

    public get actualDeparture(): moment.Moment {
        return this.data['actual_td'] ? this.dateFromTime(this.toTime(this.data['actual_td'], this.date)) : null;
    }

    public get actualArrival(): moment.Moment {
        return this.data['actual_ta'] ? this.dateFromTime(this.toTime(this.data['actual_ta'], this.date)) : null;
    }

    public get disruptionCode(): number {
        return this.data['late_canc_reason'] ? +this.data['late_canc_reason'] : null;
    }

    private dateFromTime(time: TimeOnly): moment.Moment {
        let date: moment.Moment = null;
        if (time) {
            date = time.set({
                'day': this.date.day(),
                'month': this.date.month(),
                'year': this.date.year()
            });

            // Handle times that occur other side of midnight
            if (date.diff(this.originTime) < 0) {
                date.add(1, 'days');
            }
        }
        return date;
    }
}


