import { Injectable } from '@angular/core';
import { List } from 'linqts';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IStation } from './shared/hsp-core.model';

const STATIONS_URL = '/api/resources/stations';

@Injectable()
class ResourceService {
    private m_stationCodes: Subject<List<IStation>> = new BehaviorSubject<List<IStation>>(new List<IStation>());

    constructor(private http: Http) {
      this.populate();
    }

    // Public methods
    public getStations(): Observable<List<IStation>> {
      return this.m_stationCodes;
    }

    public lookup(code: string): Observable<IStation> {
      return this.m_stationCodes.map(stations => stations.First(station => (station.value === code)));
    }

    // Private methods
    private populate(): void {
      this.http.get(STATIONS_URL).subscribe(response => {
        this.m_stationCodes.next(new List<IStation>(response.json()));
      });
    }
}

export { ResourceService }
