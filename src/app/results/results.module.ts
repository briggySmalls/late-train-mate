import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ResultsComponent } from './results.component';
import { LegComponent } from './leg/leg.component';
import { JourneyInfoComponent } from './journey-info/journey-info.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule
  ],
  declarations: [
    ResultsComponent,
    LegComponent,
    JourneyInfoComponent
  ],
  entryComponents: [
    JourneyInfoComponent
  ]
})
export class ResultsModule { }
