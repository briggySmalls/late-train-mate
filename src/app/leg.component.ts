import { Component, Input } from '@angular/core';

import { Leg } from './journey';


@Component({
    moduleId: module.id,
    selector: 'leg',
    templateUrl: 'leg.component.html',
    styleUrls: ['leg.component.css']
})
export class LegComponent {
    @Input()
    leg: Leg;
}