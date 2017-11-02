import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { List } from 'linqts';

import { Station } from './shared/hsp-core.model';
import { ResourceService } from './resource.service';

export class MockResourceService {
  private readonly stations: Station[] = [
    { code: 'KGX', text: '' },
    { code: 'FPK', text: 'Finsbury Park' },
    { code: 'SVG', text: '' },
    { code: 'HIT', text: '' },
    { code: 'LET', text: '' },
    { code: 'BDK', text: '' },
    { code: 'RYS', text: '' },
    { code: 'CBG', text: 'Cambridge' }
  ];

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
