import { Injectable } from '@angular/core';
import { List } from 'linqts';

import { IStation } from './shared/hsp-core.model';

const station_codes = require('./resources/station_codes.json');

@Injectable()
export class ResourceService {
    private m_stationCodes: List<IStation>;

    constructor() {
        this.m_stationCodes = new List<IStation>(station_codes);
    }

    // Public methods
    public getStations(): Array<IStation> {
        return this.m_stationCodes.ToArray();
    }

    public lookup(code: string): IStation {
        return this.m_stationCodes.First(station => (station.value === code));
    }
}
