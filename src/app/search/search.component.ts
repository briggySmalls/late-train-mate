import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { List } from 'linqts';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ResourceService } from '../national-rail/resource.service';
import { Station } from '../national-rail/shared/hsp-core.model';


@Component({
    moduleId: module.id,
    selector: 'search-view',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
  })
  export class SearchComponent implements OnInit {
    private m_stations: Station[];

    constructor(
        public fb: FormBuilder,
        private router: Router,
        private resourceService: ResourceService) {

        this.search = fb.group({
            // Stations
            'fromStation': ['' , Validators.required],
            'toStation': ['' , Validators.required],
            // Dates
            'fromDate': ['', Validators.required],
            'toDate': ['', Validators.required],
            // Day
            'days': ['', Validators.required],
            // Delay
            'delay': ['', Validators.required]
        });
    }

    public search: FormGroup;

    /**
     * Converts an Ng-bootstrap date to a HSP-ready date string
     * @param date The date structure
     */
    private static toHspDate(date: NgbDateStruct) {
      return `${date.year}-${date.month}-${date.day}`;
    }

    public ngOnInit(): void {
      this.resourceService
        .getStations()
        .subscribe(stations => {
          this.m_stations = stations.OrderBy(station => station.text).ToArray();
        });
    }

    public get stations(): Station[] { return this.m_stations; }

    onSubmit() {
        const link = [
            '/results',
            this.search.value.fromStation.code,
            this.search.value.toStation.code,
            SearchComponent.toHspDate(this.search.value.fromDate),
            SearchComponent.toHspDate(this.search.value.toDate),
            this.search.value.days,
            this.search.value.delay
        ];
        this.router.navigate(link);
    }

    /**
     * Function to return station matches for a given search string
     * Note: Fat arrow syntax used to keep 'this' from class scope
     */
    public stationSearch = (inputs: Observable<string>) => {
      return inputs.debounceTime(200).distinctUntilChanged()
        .map(term => term.length < 2 ? []
          : this.stations.filter(s => s.text.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));
    }

    /**
     * Converts a station to a string for typeahead
     * @param station A station to format
     */
    public stationFormatter(station: Station): string { return (station) ? station.text : ''; }
}
