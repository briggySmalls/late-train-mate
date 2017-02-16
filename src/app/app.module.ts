import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule }          from '@angular/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent }  from './app.component';
import { ResultsComponent } from './results.component';
import { SearchComponent } from './search.component';
import { JourneyDetailComponent } from './journey-detail.component';

import { ResourceService } from './national_rail/resource.service';
import { HspApiService } from './hsp-api.service';

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
      JourneyDetailComponent
  ],
  providers: [ HspApiService, ResourceService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
