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

/**
 * Validator to ensure that date is after other Control
 * @param sibling Control to validate against
 */
function dateAfterControlValidator(sibling: AbstractControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    if (control.value && sibling.value) {
      const ours = toMoment(control.value);
      const theirs = toMoment(sibling.value);
      return (ours.isBefore(theirs)) ? { 'dateAfterControlValidator': { value: control.value } } : null;
    }
    return null;
  };
}

/**
 * Helper function to convert NgbDateStruct to a Moment
 * @param date Ngb date structure
 */
function toMoment(date: NgbDateStruct): moment.Moment {
  return moment([date.year, date.month - 1, date.day]);
}


@Component({
    moduleId: module.id,
    selector: 'search-view',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
  })
  export class SearchComponent implements OnInit {
    private stations: List<Station> = new List([]);
    public search: FormGroup;
    public today: NgbDateStruct;

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
          'days': ['WEEKDAY', Validators.required],
          // Delay
          'delay': [0, Validators.required]
      });

      // Save today's date for datepicker
      const today: Date = new Date();
      this.today = { day: today.getUTCDate(), month: today.getUTCMonth() + 1, year: today.getUTCFullYear() };

      // Update validator for toDate
      this.toDate.setValidators([Validators.required, dateAfterControlValidator(this.fromDate)]);
    }

    /**
     * Converts an Ng-bootstrap date to a HSP-ready date string
     * @param date The date structure
     */
    private static toHspDate(date: NgbDateStruct) {
      return `${date.year}-${date.month}-${date.day}`;
    }

    /**
     * Station input must match a recognised station
     */
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
    public get fromDate() { return this.search.get('fromDate'); }
    public get toDate() { return this.search.get('toDate'); }

    public onSubmit() {
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
     * Helper function to determine if control should display errors
     * @param control The control to review
     */
    public isShowInvalidStation(control: AbstractControl): Boolean {
      return (control.invalid && control.dirty);
    }

    /**
     * Helper function to determine if control should display errors
     * @param control The control to review
     */
    public isShowInvalidDate(control: AbstractControl): Boolean {
      return (control.invalid && !control.pristine);
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

