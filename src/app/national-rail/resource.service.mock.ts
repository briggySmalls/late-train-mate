import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { List } from 'linqts';

import { Station } from './shared/hsp-core.model';
import { ResourceService } from './resource.service';

export class MockResourceService {
  public stations: Station[];

  public lookup = jasmine.createSpy('lookup').and.callFake((code: string) => {
    return Observable.create((observer: Observer<Station>) => {
      // Iterate through the stations and return one if found
      for (const station of this.stations) {
        if (station.code === code) {
          // We have found the station, so send it
          observer.next(station);
          break;
        }
      };
      observer.complete();
    });
  });

  public getStations = jasmine.createSpy('getStations').and.callFake(() => {
    return Observable.create((observer: Observer<List<Station>>) => {
      observer.next(new List(this.stations));
      observer.complete();
    });
  });
}
