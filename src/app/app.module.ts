import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ResultsModule } from './results/results.module';
import { SearchComponent } from './search/search.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ResourceService, HttpResourceService } from './national-rail';

@NgModule({
  imports: [
      BrowserModule,
      HttpModule,
      ReactiveFormsModule,
      FormsModule,
      AppRoutingModule,
      ResultsModule,
  ],
  declarations: [
      AppComponent,
      SearchComponent,
      PageNotFoundComponent,
  ],
  providers: [{ provide: ResourceService, useClass: HttpResourceService }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
