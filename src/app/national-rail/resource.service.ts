import { Injectable } from '@angular/core';
import { List } from 'linqts';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Station } from './shared/hsp-core.model';

const STATIONS_URL = '/api/resources/stations';

@Injectable()
class ResourceService {
    private m_stationCodes: Subject<List<Station>> = new BehaviorSubject<List<Station>>(new List<Station>());

    constructor(private http: Http) {
      this.populate();
    }

    // Public methods
    public getStations(): Observable<List<Station>> {
      return this.m_stationCodes;
    }

    public lookup(code: string): Observable<Station> {
      return this.m_stationCodes.map(stations => stations.First(station => (station.code === code)));
    }

    // Private methods
    private populate(): void {
      this.http.get(STATIONS_URL).subscribe(response => {
        this.m_stationCodes.next(new List<Station>(response.json()));
      });
    }
}

export { ResourceService }
