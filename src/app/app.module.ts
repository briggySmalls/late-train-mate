import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ResultsComponent } from './results/results.component';
import { SearchComponent } from './search/search.component';
import { LegComponent } from './leg/leg.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ResourceService } from './national-rail/resource.service';

@NgModule({
  imports: [
      BrowserModule,
      HttpModule,
      ReactiveFormsModule,
      FormsModule,
      AppRoutingModule
  ],
  declarations: [
      AppComponent,
      SearchComponent,
      ResultsComponent,
      LegComponent,
      PageNotFoundComponent,
  ],
  providers: [ ResourceService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
