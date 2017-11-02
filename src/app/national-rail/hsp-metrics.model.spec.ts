import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { List } from 'linqts';

import { MetricsCollection } from './hsp-metrics.model';
import { ResourceService } from './resource.service';
import { Station } from './shared/hsp-core.model';

const metricsJson = require('./resources/test-data/SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json');

const stations: Station[] = [
  { code: 'KGX', text: '' },
  { code: 'FPK', text: 'Finsbury Park' },
  { code: 'SVG', text: '' },
  { code: 'HIT', text: '' },
  { code: 'LET', text: '' },
  { code: 'BDK', text: '' },
  { code: 'RYS', text: '' },
  { code: 'CBG', text: 'Cambridge' }
];

export function getStationObservable(code: string): Observable<Station> {
  return Observable.create((observer: Observer<Station>) => {
    // Iterate through the stations and return one if found
    for (const station of stations) {
      if (station.code === code) {
        // We have found the station, so send it
        observer.next(station);
        break;
      }
    };
    observer.complete();
  });
}


describe('MetricsCollection', function () {
  let mC: MetricsCollection;
  const mockResourceService: ResourceService = jasmine.createSpyObj('ResourceService', ['lookup']);

  // Prepare the test
  beforeEach(async() => {
    // Create a mock lookup function
    (<jasmine.Spy>mockResourceService.lookup).and.callFake(getStationObservable);

    mC = new MetricsCollection(metricsJson, mockResourceService);
  });

  // Test object created
  it('should create object', () => expect(mC).toBeDefined() );

  // Test stations
  it('should have expected stations', () => {
    expect(mC.fromStation.code).toEqual('FPK');
    expect(mC.fromStation.text).toEqual('Finsbury Park');
    expect(mC.toStation.code).toEqual('CBG');
    expect(mC.toStation.text).toEqual('Cambridge');
  });

  // Test services
  it('should have expected number of services', () => {
    expect(mC.services.Count()).toEqual(3);
  });

  // Test metrics
  it('should have expected metrics', () => {
    // First
    expect(mC.services.ElementAt(0).metrics.ElementAt(0).percentTolerance).toEqual(100);
    expect(mC.services.ElementAt(0).metrics.ElementAt(0).numNotTolerance).toEqual(0);
    expect(mC.services.ElementAt(0).metrics.ElementAt(0).tolerance.asMinutes()).toEqual(0);
    expect(mC.services.ElementAt(0).metrics.ElementAt(0).numTolerance).toEqual(4);
    expect(mC.services.ElementAt(0).metrics.ElementAt(0).isGlobalTolerance).toEqual(true);

    expect(mC.services.ElementAt(0).metrics.ElementAt(1).percentTolerance).toEqual(100);
    expect(mC.services.ElementAt(0).metrics.ElementAt(1).numNotTolerance).toEqual(0);
    expect(mC.services.ElementAt(0).metrics.ElementAt(1).tolerance.asMinutes()).toEqual(30);
    expect(mC.services.ElementAt(0).metrics.ElementAt(1).numTolerance).toEqual(4);
    expect(mC.services.ElementAt(0).metrics.ElementAt(1).isGlobalTolerance).toEqual(false);

    // Second
    expect(mC.services.ElementAt(1).metrics.ElementAt(0).percentTolerance).toEqual(0);
    expect(mC.services.ElementAt(1).metrics.ElementAt(0).numNotTolerance).toEqual(2);
    expect(mC.services.ElementAt(1).metrics.ElementAt(0).tolerance.asMinutes()).toEqual(0);
    expect(mC.services.ElementAt(1).metrics.ElementAt(0).numTolerance).toEqual(0);
    expect(mC.services.ElementAt(1).metrics.ElementAt(0).isGlobalTolerance).toEqual(true);

    expect(mC.services.ElementAt(1).metrics.ElementAt(1).percentTolerance).toEqual(50);
    expect(mC.services.ElementAt(1).metrics.ElementAt(1).numNotTolerance).toEqual(1);
    expect(mC.services.ElementAt(1).metrics.ElementAt(1).tolerance.asMinutes()).toEqual(30);
    expect(mC.services.ElementAt(1).metrics.ElementAt(1).numTolerance).toEqual(1);
    expect(mC.services.ElementAt(1).metrics.ElementAt(1).isGlobalTolerance).toEqual(false);

    // Second
    expect(mC.services.ElementAt(2).metrics.ElementAt(0).percentTolerance).toEqual(80);
    expect(mC.services.ElementAt(2).metrics.ElementAt(0).numNotTolerance).toEqual(1);
    expect(mC.services.ElementAt(2).metrics.ElementAt(0).tolerance.asMinutes()).toEqual(0);
    expect(mC.services.ElementAt(2).metrics.ElementAt(0).numTolerance).toEqual(4);
    expect(mC.services.ElementAt(2).metrics.ElementAt(0).isGlobalTolerance).toEqual(true);

    expect(mC.services.ElementAt(2).metrics.ElementAt(1).percentTolerance).toEqual(80);
    expect(mC.services.ElementAt(2).metrics.ElementAt(1).numNotTolerance).toEqual(1);
    expect(mC.services.ElementAt(2).metrics.ElementAt(1).tolerance.asMinutes()).toEqual(30);
    expect(mC.services.ElementAt(2).metrics.ElementAt(1).numTolerance).toEqual(4);
    expect(mC.services.ElementAt(2).metrics.ElementAt(1).isGlobalTolerance).toEqual(false);
  });

  // Test attributes
  it('should have expected attributes', () => {
    // First service
    expect(mC.services.ElementAt(0).destinationStation.code).toEqual('CBG');
    expect(mC.services.ElementAt(0).arrivalTime.hour()).toEqual(1);
    expect(mC.services.ElementAt(0).arrivalTime.minute()).toEqual(24);
    expect(mC.services.ElementAt(0).tocCode).toEqual('GN');
    expect(mC.services.ElementAt(0).originStation.code).toEqual('KGX');
    expect(mC.services.ElementAt(0).departureTime.hour()).toEqual(0);
    expect(mC.services.ElementAt(0).departureTime.minute()).toEqual(11);
    expect(mC.services.ElementAt(0).serviceCount).toEqual(4);
    expect(mC.services.ElementAt(0).serviceIds.ElementAt(0)).toEqual(201610257170724);
    expect(mC.services.ElementAt(0).serviceIds.ElementAt(1)).toEqual(201610267170724);
    expect(mC.services.ElementAt(0).serviceIds.ElementAt(2)).toEqual(201610277170724);
    expect(mC.services.ElementAt(0).serviceIds.ElementAt(3)).toEqual(201610287170724);

    // Second service
    expect(mC.services.ElementAt(1).destinationStation.code).toEqual('CBG');
    expect(mC.services.ElementAt(1).arrivalTime.hour()).toEqual(1);
    expect(mC.services.ElementAt(1).arrivalTime.minute()).toEqual(42);
    expect(mC.services.ElementAt(1).tocCode).toEqual('GN');
    expect(mC.services.ElementAt(1).originStation.code).toEqual('KGX');
    expect(mC.services.ElementAt(1).departureTime.hour()).toEqual(0);
    expect(mC.services.ElementAt(1).departureTime.minute()).toEqual(11);
    expect(mC.services.ElementAt(1).serviceCount).toEqual(2);
    expect(mC.services.ElementAt(1).serviceIds.ElementAt(0)).toEqual(201610207170724);
    expect(mC.services.ElementAt(1).serviceIds.ElementAt(1)).toEqual(201610217170724);

    // Third service
    expect(mC.services.ElementAt(2).destinationStation.code).toEqual('CBG');
    expect(mC.services.ElementAt(2).arrivalTime.hour()).toEqual(1);
    expect(mC.services.ElementAt(2).arrivalTime.minute()).toEqual(30);
    expect(mC.services.ElementAt(2).tocCode).toEqual('GN');
    expect(mC.services.ElementAt(2).originStation.code).toEqual('KGX');
    expect(mC.services.ElementAt(2).departureTime.hour()).toEqual(0);
    expect(mC.services.ElementAt(2).departureTime.minute()).toEqual(11);
    expect(mC.services.ElementAt(2).serviceCount).toEqual(5);
    expect(mC.services.ElementAt(2).serviceIds.ElementAt(0)).toEqual(201610037171311);
    expect(mC.services.ElementAt(2).serviceIds.ElementAt(1)).toEqual(201610107171311);
    expect(mC.services.ElementAt(2).serviceIds.ElementAt(2)).toEqual(201610177171311);
    expect(mC.services.ElementAt(2).serviceIds.ElementAt(3)).toEqual(201610247171311);
    expect(mC.services.ElementAt(2).serviceIds.ElementAt(4)).toEqual(201610317171311);
  });
});
