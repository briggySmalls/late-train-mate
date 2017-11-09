import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ResultsComponent } from './results.component';
import { LegComponent } from './leg/leg.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule
  ],
  declarations: [
    ResultsComponent,
    LegComponent,
  ]
})
export class ResultsModule { }
