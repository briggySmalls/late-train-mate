import { Router, Response, Request } from 'express';
import { nationalRailCredentials, isStubHspApi } from '../config';
import * as request from 'request';
import * as fs from 'fs';

const hspRouter: Router = Router();

export enum Resource {
    ServiceMetrics,
    ServiceDetails
}

const HSP_ROOT = 'https://hsp-prod.rockshore.net/api'
const HSP_VERSION = 'v1'
const RESOURCES = [
    { 'resource': Resource.ServiceMetrics, 'endpoint': 'serviceMetrics'},
    { 'resource': Resource.ServiceDetails, 'endpoint': 'serviceDetails'},
]

// Debug
const TEST_DATA_PATH = `${__dirname}/test-data`;

interface ReadJsonCallback { (json: any): void };

function hspUri(resource: Resource): string {
    let endpoint: string;
    for (let res of RESOURCES) {
        if (res.resource == resource) {
            endpoint = res.endpoint;
            break;
        }
    }
    return `${HSP_ROOT}/${HSP_VERSION}/${endpoint}`;
}

function forwardRequest(req: Request, res: Response, resource: Resource): void {
    // Make a request to HSP API
    request.post(
        hspUri(resource),
        { 'json': req.body },
        (hspError, hspRes, hspBody) => {
            res.statusCode = hspRes.statusCode;
            res.json(hspBody);
        }).auth(
            nationalRailCredentials['username'],
            nationalRailCredentials['password'])
}

function fileResults(req: Request, res: Response, resource: Resource): void {
    if (resource == Resource.ServiceDetails) {
        readFile(`${TEST_DATA_PATH}/SD-${req.body['rid']}.json`, (json) => {
            res.statusCode = 200; // TODO: See if there is an enum
            res.json(json);
        })
    } else if (resource == Resource.ServiceMetrics) {
        readFile(`${TEST_DATA_PATH}/SM-FPK-CBG-0000-2359-20161001-20161101-WEEKDAY-[30].json`, (json) => {
            res.statusCode = 200; // TODO: See if there is an enum
            res.json(json);
        })
    }
}

function readFile(filename: string, callback: ReadJsonCallback): void {
    var obj;
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err;
      callback(JSON.parse(data));
    });
}

hspRouter.post('/metrics', (req: Request, res: Response) => {
    if (!isStubHspApi) {
        forwardRequest(req, res, Resource.ServiceMetrics);
    } else {    
        fileResults(req, res, Resource.ServiceMetrics);
    }
});

hspRouter.post('/details', (req: Request, res: Response) => {
    if (!isStubHspApi) {
        forwardRequest(req, res, Resource.ServiceDetails);
    } else {
        fileResults(req, res, Resource.ServiceDetails);
    }
});

export { hspRouter }
