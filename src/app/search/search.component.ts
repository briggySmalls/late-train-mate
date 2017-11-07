import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
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
    private stations: List<Station> = new List([]);
    public search: FormGroup;

    constructor(
        fb: FormBuilder,
        private router: Router,
        private resourceService: ResourceService) {

        this.search = fb.group({
            // Stations
            'fromStation': [undefined, [Validators.required, this.stationValidator()]],
            'toStation': [undefined, [Validators.required, this.stationValidator()]],
            // Dates
            'fromDate': [undefined, Validators.required],
            'toDate': [undefined, Validators.required],
            // Day
            'days': [undefined, Validators.required],
            // Delay
            'delay': [0, Validators.required]
        });
    }


    /**
     * Converts an Ng-bootstrap date to a HSP-ready date string
     * @param date The date structure
     */
    private static toHspDate(date: NgbDateStruct) {
      return `${date.year}-${date.month}-${date.day}`;
    }


    /** A hero's name can't match the given regular expression */
    private stationValidator(): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } => {
        const forbidden = !this.stations.Contains(control.value);
        return forbidden ? { 'stationValidator': { value: control.value } } : null;
      };
    }

    public ngOnInit(): void {
      this.resourceService
        .getStations()
        .subscribe(stations => {
          // Save the stations
          this.stations = stations.OrderBy(station => station.text);
        });
    }

    public get fromStation() { return this.search.get('fromStation'); }
    public get toStation() { return this.search.get('toStation'); }

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
          : this.stations.Where(s => s.text.toLowerCase().indexOf(term.toLowerCase()) > -1).Take(10).ToArray());
    }

    /**
     * Converts a station to a string for typeahead
     * @param station A station to format
     */
    public stationFormatter(station: Station): string { return (station) ? station.text : ''; }
}

