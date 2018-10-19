import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ResultsModule } from './results/results.module';
import { SearchComponent } from './search/search.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ResourceService, HttpResourceService } from './national-rail';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    ResultsModule,
    NgbModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    SearchComponent,
    PageNotFoundComponent,
    HomeComponent,
  ],
  providers: [{ provide: ResourceService, useClass: HttpResourceService }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
