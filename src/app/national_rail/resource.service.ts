import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

var station_codes = require('./resources/station_codes.json');


const STATIONS_FILE = 'app/national_rail/resources/station_codes.json';

@Injectable()
export class ResourceService {
    private stationCodes: Array<IStation>;

    constructor(private http: Http) {
        this.stationCodes = new Array<IStation>(station_codes);
    }

    // Public methods
    public getStations(): Array<IStation> {
        return this.stationCodes;
    }
}

export interface IStation {
    display: string;
    value: string;
}