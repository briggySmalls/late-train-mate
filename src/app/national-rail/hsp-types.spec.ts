import { MetricsCollection } from './hsp-types';
import { ResourceService } from './resource.service';

const TEST_DATA_PATH = `${__dirname}/resources/test-data`;
const metricsJson = require('./resources/test-data//SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json');

describe('MetricsCollection', function () {
  let mC: MetricsCollection;

  // Configure the test bed
  beforeEach((() => {
    mC = new MetricsCollection(metricsJson, new ResourceService());
  }));

  // Test component created
  it('should create service', () => expect(mC).toBeDefined() );

  // Test stations
  it('should have expected stations', () => {
    expect(mC.fromStation.value).toEqual('FPK');
    expect(mC.fromStation.display).toEqual('Finsbury Park');
    expect(mC.toStation.value).toEqual('CBG');
    expect(mC.toStation.display).toEqual('Cambridge');
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
    expect(mC.services.ElementAt(0).attributes.destinationStation.value).toEqual('CBG');
    expect(mC.services.ElementAt(0).attributes.arrivalTime.hour()).toEqual(1);
    expect(mC.services.ElementAt(0).attributes.arrivalTime.minute()).toEqual(24);
    expect(mC.services.ElementAt(0).attributes.tocCode).toEqual('GN');
    expect(mC.services.ElementAt(0).attributes.originStation.value).toEqual('KGX');
    expect(mC.services.ElementAt(0).attributes.departureTime.hour()).toEqual(0);
    expect(mC.services.ElementAt(0).attributes.departureTime.minute()).toEqual(11);
    expect(mC.services.ElementAt(0).attributes.serviceCount).toEqual(4);
    expect(mC.services.ElementAt(0).attributes.serviceIds.ElementAt(0)).toEqual(201610257170724);
    expect(mC.services.ElementAt(0).attributes.serviceIds.ElementAt(1)).toEqual(201610267170724);
    expect(mC.services.ElementAt(0).attributes.serviceIds.ElementAt(2)).toEqual(201610277170724);
    expect(mC.services.ElementAt(0).attributes.serviceIds.ElementAt(3)).toEqual(201610287170724);

    // Second service
    expect(mC.services.ElementAt(1).attributes.destinationStation.value).toEqual('CBG');
    expect(mC.services.ElementAt(1).attributes.arrivalTime.hour()).toEqual(1);
    expect(mC.services.ElementAt(1).attributes.arrivalTime.minute()).toEqual(42);
    expect(mC.services.ElementAt(1).attributes.tocCode).toEqual('GN');
    expect(mC.services.ElementAt(1).attributes.originStation.value).toEqual('KGX');
    expect(mC.services.ElementAt(1).attributes.departureTime.hour()).toEqual(0);
    expect(mC.services.ElementAt(1).attributes.departureTime.minute()).toEqual(11);
    expect(mC.services.ElementAt(1).attributes.serviceCount).toEqual(2);
    expect(mC.services.ElementAt(1).attributes.serviceIds.ElementAt(0)).toEqual(201610207170724);
    expect(mC.services.ElementAt(1).attributes.serviceIds.ElementAt(1)).toEqual(201610217170724);

    // Third service
    expect(mC.services.ElementAt(2).attributes.destinationStation.value).toEqual('CBG');
    expect(mC.services.ElementAt(2).attributes.arrivalTime.hour()).toEqual(1);
    expect(mC.services.ElementAt(2).attributes.arrivalTime.minute()).toEqual(30);
    expect(mC.services.ElementAt(2).attributes.tocCode).toEqual('GN');
    expect(mC.services.ElementAt(2).attributes.originStation.value).toEqual('KGX');
    expect(mC.services.ElementAt(2).attributes.departureTime.hour()).toEqual(0);
    expect(mC.services.ElementAt(2).attributes.departureTime.minute()).toEqual(11);
    expect(mC.services.ElementAt(2).attributes.serviceCount).toEqual(5);
    expect(mC.services.ElementAt(2).attributes.serviceIds.ElementAt(0)).toEqual(201610037171311);
    expect(mC.services.ElementAt(2).attributes.serviceIds.ElementAt(1)).toEqual(201610107171311);
    expect(mC.services.ElementAt(2).attributes.serviceIds.ElementAt(2)).toEqual(201610177171311);
    expect(mC.services.ElementAt(2).attributes.serviceIds.ElementAt(3)).toEqual(201610247171311);
    expect(mC.services.ElementAt(2).attributes.serviceIds.ElementAt(4)).toEqual(201610317171311);
  });
});
