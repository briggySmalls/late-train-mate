import { Injectable } from '@angular/core';
import { List } from 'linqts';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Station, Disruption } from './shared/hsp-core.model';

const STATIONS_URL = '/api/resources/stations';
const DISRUPTIONS_URL = '/api/resources/disruptions';

@Injectable()
export abstract class ResourceService {
  protected stations: Subject<List<Station>> = new BehaviorSubject<List<Station>>(new List<Station>());
  protected disruptions: Subject<List<Disruption>> = new BehaviorSubject<List<Disruption>>(new List<Disruption>());

  public getStations(): Observable<List<Station>> {
    return this.stations.map(stations => stations.DistinctBy(station => station.code));
  }

  public lookupStation(code: string): Observable<Station> {
    return this.stations.map(stations => stations.FirstOrDefault(station => (station.code === code)));
  }

  public lookupDisruption(code: number): Observable<Disruption> {
    return this.disruptions.map(disruptions => disruptions.FirstOrDefault(disruption => (disruption.code === code)));
  }
}

@Injectable()
export class HttpResourceService extends ResourceService {
    constructor(private http: Http) {
      super();

      // Assign stations with a http result
      this.http.get(STATIONS_URL).subscribe(response => {
        this.stations.next(new List<Station>(response.json()).OrderBy(station => station.text));
      });

      // Assign disruptions with a http result
      this.http.get(DISRUPTIONS_URL).subscribe(response => {
        this.disruptions.next(new List<Disruption>(response.json()));
      });
    }
}
