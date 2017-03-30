var redisService = require('../services/redisService');


var functionFindFootprints = function (arr) {
    var foundFootprints = [];
    var counterCallback = 0;

    return arr.reduce(function (promise, interfaceId) {
        return promise.then(function () {
            return redisService.listRangeAsync("footprints:" + interfaceId, 0, -1)
                .then(function (res) {
                    counterCallback ++;
                    foundFootprints.push(res);
                    if (counterCallback === arr.length){
                        return foundFootprints;
                    }
                })
        });
    },
        Promise.resolve());
}

var functionFindOrigins = function (arr) {
    var foundOrigins = [];
    var counterCallback = 0;
    return arr.reduce(function (promise, origin) {
        return promise.then(function () {
            return redisService.listRangeAsync("remoteEndpointOrigins:" + origin.remoteEndpointId, 0, -1)
                .then(function (res) {
                    counterCallback ++;
                    foundOrigins.push(res);
                    if (counterCallback === arr.length){
                        return foundOrigins;
                    }
                });
        });
    },
        Promise.resolve());
}


module.exports = {
    functionFindFootprints: functionFindFootprints,
    functionFindOrigins: functionFindOrigins
}