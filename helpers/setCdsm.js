var setContentOrigins = function (data, cdsmUrl, rfqdn, endpointId, endpointUrl) {

    return new Promise(function (resolve, reject) {

        var cdsm = require('../services/ciscoCdsService');
        var redisService = require("../services/redisService");
        // array where are stored successfully created content origins
        var createdContentOrigins = [];
        var createdDeliveryService = [];
        var callbackCounter = 2;
        var recordsCount = data.length;

        //because for can be called only one time there is this hack used
        //loop through all content origins which was received
        for (var i = 0, len = data.length; i < len; i++) {


            var obj = data[i];

            var conOrig = {
                name: obj.name,
                originFqdn: obj.originFqdn,
                rfqdn: obj.rfqdn
            };

            if (rfqdn.length === 0) {
                reject("There is no rfqdn left");
            }
            // create content origin, return obj with created content origin
            cdsm.createContentOrigin(cdsmUrl, conOrig, rfqdn[i])
                .then(function (createdOrigin) {
                    createdContentOrigins.push(createdOrigin);
                    cdsm.createDeliveryService(cdsmUrl, createdOrigin)
                        .then(function (idCreatedDeliveryService) {
                            createdDeliveryService.push(idCreatedDeliveryService);
                            // idCreatedDeliveryService is passed only for future use in assigning service engine
                            cdsm.getServiceEngines(cdsmUrl)
                                .then(function (devices) {
                                    
                                    if (devices.Devices.length != 0) {
                                        for (var i = 0; i < devices.Devices.length; i++) {
                                            cdsm.assignServiceEngine(cdsmUrl, idCreatedDeliveryService, devices.Devices[i].$.id)
                                                .then(function (result) {
                                                    callbackCounter++;
                                                    //after successfull setting of all content origins save them in redis as remoteEndpoint:{{ID}}
                                                    if (callbackCounter === recordsCount) {
                                                        redisService.deleteItem("remoteEndpointDownstreamDelSer:" + endpointId);
                                                        redisService.deleteItemAsync("remoteEndpointDownstream:" + endpointId)
                                                            .then(function (found) {
                                                                callbackRedisCounter = 0;
                                                                for (var j = 0; j < createdDeliveryService.length; j++) {
                                                                    redisService.rightPush("remoteEndpointDownstreamDelSer:" + endpointId, createdDeliveryService[j]);
                                                                }
                                                                //for now insert new created services to redis according to ID
                                                                for (var i = 0; i < createdContentOrigins.length; i++) {
                                                                    var obj = createdContentOrigins[i];

                                                                    var conOrig = {
                                                                        remoteEndpointId: endpointId,
                                                                        name: obj.Name,
                                                                        originFqdn: obj.OriginFqdn,
                                                                        rfqdn: obj.Fqdn,
                                                                        id: obj.ID
                                                                    };

                                                                    var stringObj = JSON.stringify(conOrig);

                                                                    redisService.rightPushAsync("remoteEndpointDownstream:" + endpointId, stringObj)
                                                                        .then(function (resPush) {
                                                                            callbackRedisCounter++;
                                                                            if (callbackRedisCounter === createdContentOrigins.length) {
                                                                                resolve("Success");
                                                                            }
                                                                        })
                                                                        .catch(function (err) {
                                                                            console.log(err);
                                                                        })
                                                                }
                                                            })
                                                            .catch(function (err) {
                                                                //delete not applied
                                                            })
                                                    }   
                                                })
                                                .catch(function (err) {
                                                    console.log(err);
                                                });
                                            break;
                                        }
                                    }
                                    else {
                                        var obj = {
                                            status: "Error",
                                            operation: "Error, no online delivery services available",
                                            response: devices.deliveryserviceProvisioning
                                        }
                                        reject(obj);
                                    }
                                })
                                .catch(function (err) {
                                    console.log(err);
                                })
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    });
}

module.exports = {
    setContentOrigins: setContentOrigins
}