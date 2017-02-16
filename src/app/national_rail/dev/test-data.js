"use strict";
var hsp_types_1 = require('../hsp-types');
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/delay');
var SERVICE_METRICS_URL = "app/national_rail/dev/test-data/3_0d_1c/service_metrics.json";
var JOURNEY_DETAILS_URL_ROOT = "app/national_rail/dev/test-data/3_0d_1c/";
var TestData = (function () {
    function TestData(http) {
        this.http = http;
    }
    TestData.prototype.serviceMetrics = function () {
        return this.http.get(SERVICE_METRICS_URL)
            .delay(2000)
            .toPromise()
            .then(function (response) { return new hsp_types_1.MetricsCollection(response.json()); })
            .catch(this.handleError);
    };
    TestData.prototype.JourneyDetails = function (rid) {
        return this.http.get(this.journeyDetailsFile(rid))
            .delay(2000)
            .toPromise()
            .then(function (response) { return new hsp_types_1.JourneyDetails(response.json()); })
            .catch(this.handleError);
    };
    TestData.prototype.journeyDetailsFile = function (rid) {
        return "" + JOURNEY_DETAILS_URL_ROOT + rid + ".json";
    };
    TestData.prototype.handleError = function (error) {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    };
    return TestData;
}());
exports.TestData = TestData;
//# sourceMappingURL=test-data.js.map