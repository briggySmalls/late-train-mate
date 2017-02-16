import { List } from 'linqts';
import * as moment from 'moment';


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
    protected toTime(timeText: string): moment.Moment {
        return moment(timeText, 'HHmm');
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

/* ----------------------------------------------------------------------------
 * Metrics Collection
 * --------------------------------------------------------------------------*/

export class MetricsCollection extends HspApiData {
    /**
     * @brief      The start station for which metrics were calculated
     *
     * @return     A station TLA
     */
    public get fromStation(): string {
        return this.data['header']['from_location'];
    }

    /**
     * @brief      The end station for which metrics were calculated
     *
     * @return     A station TLA
     */
    public get toStation(): string {
        return this.data['header']['to_location'];
    }

    public get services(): List<ServiceMetrics> {
        return new List<ServiceMetrics>(this.data['Services'].map(
            (serviceData: any) => new ServiceMetrics(serviceData)));
    }
}

export class ServiceMetrics extends HspApiData {
    public get departureTime(): moment.Moment {
        return this.toTime(this.attributes['gbtt_ptd']);
    };

    public get arrivalTime(): moment.Moment {
        return this.toTime(this.attributes['gbtt_pta']);
    }

    public get originStation(): string {
        return this.attributes['origin_location'];
    }

    public get destinationStation(): string {
        return this.attributes['destination_location'];
    }

    public get tocCode(): string {
        return this.attributes['toc_code'];
    }

    public get serviceCount(): number {
        return this.attributes['matched_services'];
    }

    public get serviceIds(): List<number> {
        return new List<number>(this.attributes['rids']);
    }

    public get metrics(): List<Metric> {
        return new List<Metric>(this.data['Metrics'].map(
            (metricData: any) => new Metric(metricData)));
    }

    private get attributes(): any {
        return this.data['serviceAttributesMetrics']
    };
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
        return (this.data['global_tolerance'] == 'true');
    }
}

/* ----------------------------------------------------------------------------
 * Journey Details
 * --------------------------------------------------------------------------*/


export class JourneyDetails extends HspApiData {

    public get date(): moment.Moment {
        return this.toDate(this.attributeDetails['date_of_service']);
    }

    public get tocCode(): String {
        return this.attributeDetails['toc_code'];
    }

    public get serviceId(): number {
        return this.attributeDetails['rid'];
    }

    public get stops(): List<StopDetails> {
        return new List<StopDetails>(this.attributeDetails['locations'].map(
            (locationData: any) => new StopDetails(locationData)));
    }

    private get attributeDetails(): any {
        return this.data['serviceAttributesDetails'];
    }
}


export class StopDetails extends HspApiData {

    public get station(): String {
        return this.data['location'];
    }

    public get scheduledDeparture(): moment.Moment {
        return this.data['gbtt_ptd'] ? this.toTime(this.data['gbtt_ptd']) : null;
    }

    public get scheduledArrival(): moment.Moment {
        return this.data['gbtt_pta'] ? this.toTime(this.data['gbtt_pta']) : null;
    }

    public get actualDeparture(): moment.Moment {
        return this.data['actual_td'] ? this.toTime(this.data['actual_td']) : null;
    }

    public get actualArrival(): moment.Moment {
        return this.data['actual_ta'] ? this.toTime(this.data['actual_ta']) : null;
    }

    public get disruptionCode(): number {
        return this.data['late_canc_reason'] ? +this.data['late_canc_reason']: null;
    }
}


