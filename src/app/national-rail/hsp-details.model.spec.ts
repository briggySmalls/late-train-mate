import { JourneyDetails } from './hsp-details.model';
import { ResourceService } from './resource.service';

const TEST_DATA_PATH = `${__dirname}/resources/test-data`;
const detailsJson = require('./resources/test-data/SD-201610037170608.json');

describe('JourneyDetails', function () {
  let jD: JourneyDetails;

  // Configure the test bed
  beforeEach((() => {
    jD = new JourneyDetails(detailsJson, new ResourceService());
  }));

  // Test component created
  it('should create service', () => expect(jD).toBeDefined() );

});
