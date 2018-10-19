import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Journey } from '../journey';
import { HspApiService, ResourceService } from '../../national-rail';

@Component({
  selector: 'late-mate-journey-info',
  templateUrl: './journey-info.component.html',
  styleUrls: ['./journey-info.component.scss']
})
export class JourneyInfoComponent {
  constructor(public activeModal: NgbActiveModal,
    public hspApiService: HspApiService,
    public resourceService: ResourceService) {}

  @Input()
  journey: Journey;
}
