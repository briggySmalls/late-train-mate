import { Component, Input } from '@angular/core';
import { Journey } from '../journey';

@Component({
  selector: 'late-mate-journey-info',
  templateUrl: './journey-info.component.html',
  styleUrls: ['./journey-info.component.scss']
})
export class JourneyInfoComponent {
  @Input()
  journey: Journey;
}
