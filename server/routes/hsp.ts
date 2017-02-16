import { Router, Response, Request } from 'express';
import { nationalRailCredentials } from '../config';
import * as request from 'request';

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

function forwardRequest(req: Request, res: Response, resource: Resource):void {
    // Make a request to HSP API
    request.post(
        hspUri(resource),
        {
            'json': req.body,
        },
        (hspError, hspRes, hspBody) => {
            res.statusCode = hspRes.statusCode;
            res.json(hspBody);
        }
    ).auth(nationalRailCredentials['username'], nationalRailCredentials['password'])
}

hspRouter.post('/metrics', (req: Request, res: Response) => {
    forwardRequest(req, res, Resource.ServiceMetrics);
});

hspRouter.post('/details', (req: Request, res: Response) => {
    forwardRequest(req, res, Resource.ServiceDetails);
});

export { hspRouter }
