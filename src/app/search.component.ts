import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';

import { ResourceService } from './national_rail/resource.service';
import { IStation } from './national_rail/hsp-types';


@Component({
    moduleId: module.id,
    selector: 'search-view',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
})
export class SearchComponent implements OnInit {
    constructor(
        public fb: FormBuilder,
        private router: Router,
        private resourceService: ResourceService) {

        this.search = fb.group({
            // Stations
            "fromStation": ["" , Validators.required],
            "toStation": ["" , Validators.required],
            // Dates
            "fromDate": ["", Validators.required],
            "toDate": ["", Validators.required],
            // Day
            "days": ["", Validators.required],
            // Delay
            "delay": ["", Validators.required]
        });
    }

    public search: FormGroup;

    private m_stations: IStation[];

    public ngOnInit(): void {
        this.m_stations = this.resourceService.getStations();
    }

    public get stations(): IStation[] { return this.m_stations; }

    onSubmit() {
        let link = [
            "/results",
            this.search.value.fromStation, this.search.value.toStation,
            this.search.value.fromDate, this.search.value.toDate,
            this.search.value.days, this.search.value.delay
        ]
        this.router.navigate(link);
    }
}
