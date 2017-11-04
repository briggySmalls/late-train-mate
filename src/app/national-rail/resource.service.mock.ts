import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { List } from 'linqts';

import { Station } from './shared/hsp-core.model';
import { ResourceService } from './resource.service';

export class MockResourceService extends ResourceService {
  public setStations(stations: Station[]) {
    this.stations.next(new List(stations));
  }
}
