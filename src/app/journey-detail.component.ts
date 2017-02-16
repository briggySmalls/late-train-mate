import { Component, Input } from '@angular/core';

import { Journey } from './journey';


@Component({
    moduleId: module.id,
    selector: 'journey-detail',
    templateUrl: 'journey-detail.component.html',
    styleUrls: ['journey-detail.component.css']
})
export class JourneyDetailComponent {
    @Input()
    journey: Journey;
}