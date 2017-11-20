import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Journey } from '../journey';
import { HspApiService } from '../../national-rail/index';

@Component({
  selector: 'late-mate-journey-info',
  templateUrl: './journey-info.component.html',
  styleUrls: ['./journey-info.component.scss']
})
export class JourneyInfoComponent {
  constructor(public activeModal: NgbActiveModal,
    public hspApiService: HspApiService) { }

  @Input()
  journey: Journey;
}
