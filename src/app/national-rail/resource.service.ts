import { Injectable } from '@angular/core';
import { List } from 'linqts';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Station } from './shared/hsp-core.model';

const STATIONS_URL = '/api/resources/stations';

@Injectable()
export abstract class ResourceService {
  protected stations: Subject<List<Station>> = new BehaviorSubject<List<Station>>(new List<Station>());

  // Public methods
  public getStations(): Observable<List<Station>> {
    return this.stations;
  }

  public lookup(code: string): Observable<Station> {
    return this.stations.map(stations => stations.First(station => (station.code === code)));
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
    }
}

