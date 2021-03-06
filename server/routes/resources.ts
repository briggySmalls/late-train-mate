import * as assert from "assert";
import { Request, Response, Router } from "express";
import * as fs from "fs";

import * as request from "request";
import { Parser } from "xml2js";

/**
 * TODO: Remove 'I' and potentially replace with a class?
 */
interface IStation {
  readonly code: string;
  readonly text: string;
}

interface IReason {
  readonly code: number;
  readonly text: string;
}

const resourcesRouter: Router = Router();
const RESOURCES_PATH = `${__dirname}/resources`;
const STATIONS_FILE_PATH = `${RESOURCES_PATH}/*_ref_v3.xml`;

// Populate the stations list immediately
let allStations: IStation[] = [];
let allReasons: IReason[] = [];

// Load the resources from disk when we load the module
loadResources();

/**
 * @brief      Loads resources from the resources file
 * @return     None
 */
function loadResources() {
  // First find potential resource files
  fs.readdir(RESOURCES_PATH, (dirErr, files) => {
    if (dirErr) {
      throw dirErr;
    }
    assert(files.length > 0, "No resource file found");

    // Create a new XML parser
    const p = new Parser();

    // Read the most-recent resources file
    fs.readFile(`${RESOURCES_PATH}/${files.sort()[0]}`, "utf8", (readErr, data) => {
      if (readErr) {
        throw readErr;
      }
      // Parse the xml content
      p.parseString(data, (parseErr, result) => {
        if (parseErr) {
          throw parseErr;
        }
        loadStations(result);
        loadReasons(result);
      });
    });
  });
}

/**
 * @brief      Loads stations from the resource data
 *
 * @param      data  The parsed xml data
 * @return     None
 */
function loadStations(data: any) {
  allStations = [];
  // Add a key for each station
  for (const location of data.PportTimetableRef.LocationRef) {
    if (location.$.hasOwnProperty("toc")) {
      assert(location.$.hasOwnProperty("crs"), `Station with TOC: ${location.$.toc} is missing crs property`);
      assert(location.$.hasOwnProperty("locname"), `Station ${location.$.crs} is missing locname property`);
      allStations.push({code: location.$.crs, text: location.$.locname});
    }
  }
}

/**
 * @brief      Loads reasons from the resource data
 *
 * @param      data  The parsed xml data
 * @return     None
 */
function loadReasons(data: any) {
  allReasons = [];
  // Add a key for each late running reason
  for (const reason of data.PportTimetableRef.LateRunningReasons[0].Reason) {
    assert(reason.$.hasOwnProperty("code"));
    assert(reason.$.hasOwnProperty("reasontext"));
    allReasons.push({code: +reason.$.code, text: reason.$.reasontext});
  }
  // Add a key for each cancellation reason
  for (const reason of data.PportTimetableRef.CancellationReasons[0].Reason) {
    assert(reason.$.hasOwnProperty("code"));
    assert(reason.$.hasOwnProperty("reasontext"));
    allReasons.push({code: +reason.$.code, text: reason.$.reasontext});
  }
}

// Get all stations
resourcesRouter.get("/stations", (req: Request, resp: Response) => {
  resp.json(allStations);
});

// Get all reasons
resourcesRouter.get("/disruptions", (req: Request, resp: Response) => {
  resp.json(allReasons);
});

export { resourcesRouter };
