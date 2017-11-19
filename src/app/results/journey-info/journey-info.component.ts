import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Journey } from '../journey';

@Component({
  selector: 'late-mate-journey-info',
  templateUrl: './journey-info.component.html',
  styleUrls: ['./journey-info.component.scss']
})
export class JourneyInfoComponent {
  constructor(public activeModal: NgbActiveModal) { }

  @Input()
  journey: Journey;
}
