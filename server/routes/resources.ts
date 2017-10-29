import * as assert from "assert";
import { Request, Response, Router } from "express";
import * as fs from "fs";
import * as request from "request";
import { Parser } from "xml2js";

/**
 * TODO: Remove 'I' and potentially replace with a class?
 */
interface IStation {
    display: string;
    value: string;
}

const resourcesRouter: Router = Router();
const RESOURCES_PATH = `${__dirname}/resources`;
const STATIONS_FILE_PATH = `${RESOURCES_PATH}/station-codes.xml`;

// Populate the stations list immediately
let allStations: IStation[];
load_stations();

function load_stations() {
  // Create a new XML parser
  let p = new Parser();

  // Parse the stations file
  fs.readFile(STATIONS_FILE_PATH, "utf8", (readErr, data) => {
    if (readErr) {
      throw readErr;
    }
    allStations = [];
    // Parse the station-codes xml document
    p.parseString(data, (parseErr, result) => {
      if (parseErr) {
        throw parseErr;
      }
      // Add a key for each station
      for (let station of result.StationList.Station) {
        assert(station.Name.length === 1);
        assert(station.CrsCode.length === 1);
        allStations.push({value: station.CrsCode[0], display: station.Name[0]});
      }
    });
  });
}

// Get all stations
resourcesRouter.get("/stations", (request: Request, response: Response) => {
  response.json(allStations);
});

export { resourcesRouter };
