import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { List } from 'linqts';
import { async } from '@angular/core/testing';

import { JourneyDetails } from './hsp-details.model';
import { MockResourceService } from './resource.service.mock';
import { Station } from './shared/hsp-core.model';

const detailsJson = require('./resources/test-data/SD-201610037170624.json');

describe('JourneyDetails', function () {
  let jD: JourneyDetails;

  // Prepare the test
  beforeEach(async(() => {
    // Create a resource service
    const resourceService = new MockResourceService();
    // Set the stations as you like
    resourceService.setStations([
      { code: 'KGX', text: '' },
      { code: 'FPK', text: 'Finsbury Park' },
      { code: 'SVG', text: '' },
      { code: 'HIT', text: '' },
      { code: 'LET', text: '' },
      { code: 'BDK', text: '' },
      { code: 'RYS', text: '' },
      { code: 'CBG', text: 'Cambridge' }
    ]);
    // Create the unit under test
    jD = new JourneyDetails(detailsJson, resourceService);
  }));

  // Test object created
  it('should create object', () => expect(jD).toBeDefined() );

  // Test journey attributes
  it('should have expected attributes', () => {
    expect(jD.date.year()).toEqual(2016);
    expect(jD.date.month()).toEqual(10 - 1); // Months are 0-base
    expect(jD.date.date()).toEqual(3);
    expect(jD.tocCode).toEqual('GN');
    expect(jD.serviceId).toEqual(201610037170624);
  });

  // Test journey stops
  it('should have expected stops', () => {

    // Stop 1
    expect(jD.stops.ElementAt(0).station.code).toEqual('KGX');
    expect(jD.stops.ElementAt(0).scheduledArrival).toBeUndefined();
    expect(jD.stops.ElementAt(0).actualArrival).toBeUndefined();
    expect(jD.stops.ElementAt(0).scheduledDeparture.hour()).toEqual(9);
    expect(jD.stops.ElementAt(0).scheduledDeparture.minute()).toEqual(52);
    expect(jD.stops.ElementAt(0).actualDeparture.hour()).toEqual(9);
    expect(jD.stops.ElementAt(0).actualDeparture.minute()).toEqual(52);
    expect(jD.stops.ElementAt(0).disruptionCode).toEqual(904);

    // Stop 2
    expect(jD.stops.ElementAt(1).station.code).toEqual('FPK');
    expect(jD.stops.ElementAt(1).scheduledArrival.hour()).toEqual(9);
    expect(jD.stops.ElementAt(1).scheduledArrival.minute()).toEqual(57);
    expect(jD.stops.ElementAt(1).actualArrival.hour()).toEqual(9);
    expect(jD.stops.ElementAt(1).actualArrival.minute()).toEqual(56);
    expect(jD.stops.ElementAt(1).scheduledDeparture.hour()).toEqual(9);
    expect(jD.stops.ElementAt(1).scheduledDeparture.minute()).toEqual(58);
    expect(jD.stops.ElementAt(1).actualDeparture.hour()).toEqual(9);
    expect(jD.stops.ElementAt(1).actualDeparture.minute()).toEqual(58);
    expect(jD.stops.ElementAt(1).disruptionCode).toEqual(904);

    // Stop 3
    expect(jD.stops.ElementAt(2).station.code).toEqual('SVG');
    expect(jD.stops.ElementAt(2).scheduledArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(2).scheduledArrival.minute()).toEqual(17);
    expect(jD.stops.ElementAt(2).actualArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(2).actualArrival.minute()).toEqual(26);
    expect(jD.stops.ElementAt(2).scheduledDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(2).scheduledDeparture.minute()).toEqual(17);
    expect(jD.stops.ElementAt(2).actualDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(2).actualDeparture.minute()).toEqual(28);
    expect(jD.stops.ElementAt(2).disruptionCode).toEqual(904);

    // Stop 4
    expect(jD.stops.ElementAt(3).station.code).toEqual('HIT');
    expect(jD.stops.ElementAt(3).scheduledArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(3).scheduledArrival.minute()).toEqual(22);
    expect(jD.stops.ElementAt(3).actualArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(3).actualArrival.minute()).toEqual(31);
    expect(jD.stops.ElementAt(3).scheduledDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(3).scheduledDeparture.minute()).toEqual(22);
    expect(jD.stops.ElementAt(3).actualDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(3).actualDeparture.minute()).toEqual(33);
    expect(jD.stops.ElementAt(3).disruptionCode).toEqual(904);

    // Stop 5
    expect(jD.stops.ElementAt(4).station.code).toEqual('LET');
    expect(jD.stops.ElementAt(4).scheduledArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(4).scheduledArrival.minute()).toEqual(27);
    expect(jD.stops.ElementAt(4).actualArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(4).actualArrival.minute()).toEqual(37);
    expect(jD.stops.ElementAt(4).scheduledDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(4).scheduledDeparture.minute()).toEqual(28);
    expect(jD.stops.ElementAt(4).actualDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(4).actualDeparture.minute()).toEqual(39);
    expect(jD.stops.ElementAt(4).disruptionCode).toEqual(904);

    // Stop 6
    expect(jD.stops.ElementAt(5).station.code).toEqual('BDK');
    expect(jD.stops.ElementAt(5).scheduledArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(5).scheduledArrival.minute()).toEqual(31);
    expect(jD.stops.ElementAt(5).actualArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(5).actualArrival.minute()).toEqual(41);
    expect(jD.stops.ElementAt(5).scheduledDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(5).scheduledDeparture.minute()).toEqual(31);
    expect(jD.stops.ElementAt(5).actualDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(5).actualDeparture.minute()).toEqual(42);
    expect(jD.stops.ElementAt(5).disruptionCode).toEqual(904);

    // Stop 7
    expect(jD.stops.ElementAt(6).station.code).toEqual('RYS');
    expect(jD.stops.ElementAt(6).scheduledArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(6).scheduledArrival.minute()).toEqual(39);
    expect(jD.stops.ElementAt(6).actualArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(6).actualArrival.minute()).toEqual(49);
    expect(jD.stops.ElementAt(6).scheduledDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(6).scheduledDeparture.minute()).toEqual(39);
    expect(jD.stops.ElementAt(6).actualDeparture.hour()).toEqual(10);
    expect(jD.stops.ElementAt(6).actualDeparture.minute()).toEqual(51);
    expect(jD.stops.ElementAt(6).disruptionCode).toEqual(904);

    // Stop 8
    expect(jD.stops.ElementAt(7).station.code).toEqual('CBG');
    expect(jD.stops.ElementAt(7).scheduledArrival.hour()).toEqual(10);
    expect(jD.stops.ElementAt(7).scheduledArrival.minute()).toEqual(55);
    expect(jD.stops.ElementAt(7).actualArrival.hour()).toEqual(11);
    expect(jD.stops.ElementAt(7).actualArrival.minute()).toEqual(4);
    expect(jD.stops.ElementAt(7).scheduledDeparture).toBeUndefined();
    expect(jD.stops.ElementAt(7).actualDeparture).toBeUndefined();
    expect(jD.stops.ElementAt(7).disruptionCode).toEqual(904);
  });
});
