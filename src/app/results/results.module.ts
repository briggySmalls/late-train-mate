import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultsComponent } from './results.component';
import { LegComponent } from './leg/leg.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ResultsComponent,
    LegComponent,
  ]
})
export class ResultsModule { }
