import { MetricsCollection, JourneyDetails } from '../hsp-types';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';

const SERVICE_METRICS_URL = "app/national_rail/dev/test-data/SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json";
const JOURNEY_DETAILS_URL_ROOT = "app/national_rail/dev/test-data";


export class TestData {
    constructor(private http: Http) {
    }

    public serviceMetrics(): Observable<MetricsCollection> {
        return this.http.get(SERVICE_METRICS_URL)
            .delay(TestData.getDelay())
            .map(
                (response: any) => new MetricsCollection(response.json()),
                this.handleError);
    }

    public journeyDetails(serviceId: number): Observable<JourneyDetails> {
        let url = TestData.journeyDetailsFile(serviceId);
        console.log("Reading file: " + url);
        return this.http.get(url)
            .delay(TestData.getDelay())
            .map(
                (response: any) => new JourneyDetails(response.json()),
                this.handleError);
    }

    /**
     * @brief      Gets a delay
     *
     * @return     The delay.
     */
    private static getDelay(): number {
        return ((Math.random() * 2500) + 500);
    }

    private static journeyDetailsFile(serviceId: number): string {
        return `${JOURNEY_DETAILS_URL_ROOT}/SD-${serviceId}.json`;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error) // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
