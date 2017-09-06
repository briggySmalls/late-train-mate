import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

import { MetricsCollection, JourneyDetails } from './national_rail/hsp-types';
import { ResourceService } from './national_rail/resource.service';


const SERVICE_METRICS_URL = '/api/hsp/metrics';
const SERVICE_DETAILS_URL = '/api/hsp/details';


@Injectable()
export class HspApiService {

    constructor(private http: Http,
                private resourceService: ResourceService) { }

    public serviceMetrics(fromStation: string, toStation: string,
                          fromDate: moment.Moment, toDate: moment.Moment,
                          days: string, delays: moment.Duration[]): Observable<MetricsCollection> {

        return this.http.post(SERVICE_METRICS_URL, {
            "from_loc": fromStation, "to_loc": toStation,
            "from_time": "0000", "to_time": "2359",
            "from_date": this.toHspDate(fromDate), "to_date": this.toHspDate(toDate),
            "days": days,
            "tolerance": delays.map(value => value.minutes())})
                // Map the http results stream to a stream of MetricsCollections
                .map(
                    (response: any) => new MetricsCollection(response.json(), this.resourceService),
                    this.handleError);
    }

    public journeyDetails(serviceId: number): Observable<JourneyDetails> {
        return this.http.post(SERVICE_DETAILS_URL, {"rid": serviceId.toString()})
            .map(
                (response: any) => new JourneyDetails(response.json(), this.resourceService),
                this.handleError);
    }

    private toHspDate(date: moment.Moment): string {
        return date.format("YYYY-MM-DD");
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error) // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
