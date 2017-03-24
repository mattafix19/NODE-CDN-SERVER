var redisService = require('../services/redisService');
var db = require('../services/databaseService.js');

var ipUtils = require('ip2long');
var long2ip = ipUtils.long2ip;

var cidr = require('cidr.rb');

var processResponse = function (data) {
    return new Promise(function (resolve, reject) {
        var contentOrigins = data.ContentOrigins;
        var footprints = data.Footprints;
        var sender = data.Sender;
        var remoteEndpointId = data.remoteEndpointId;

        var url = sender.url;
        var localInterface = null;

        //load own interface in DB -> ID = 1
        db.getOwnInterface()
            .then(function (localInter) {
                localInterface = localInter;
                //find url from request in database, we must find which record in our database is Requested
                db.db.any('SELECT * from cdn_interface WHERE url=($1)', [url])
                    .then(function (result) {
                        //save id and url of record in our database
                        var rmtEndptId = result[0].id;
                        var remoteEndpointUrl = result[0].url;

                        var callbackCounter = 0;
                        if (footprints.length === 0) {
                            return;
                        }

                        db.db.any('DELETE FROM FOOTPRINT WHERE endpoint_id=($1)', [rmtEndptId])
                            .then(function (resultDeletion) {
                                for (var i = 0; i < footprints.length; i++) {

                                    var network = new cidr.Net(footprints[i].subnet_ip + "/" + footprints[i].prefix);
                                    var netAddressLong = network.netaddr();
                                    var netAddress = long2ip(netAddressLong.addr);

                                    var subnetNumber = netAddressLong.addr;
                                    var maskNumber = network.mask.addr;

                                    var obj = {
                                        maskNum: maskNumber,
                                        prefix: footprints[i].prefix,
                                        subnetIp: footprints[i].subnet_ip,
                                        subnetNum: subnetNumber
                                    }

                                    var stringified = JSON.stringify(obj);
                                    redisService.deleteItem("footprints:" + rmtEndptId);
                                    redisService.rightPush("footprints:" + rmtEndptId, stringified);

                                    redisService.deleteItem("remoteEndpointIds:" + rmtEndptId);
                                    redisService.rightPush("remoteEndpointIds:" + rmtEndptId,  remoteEndpointId);

                                    //promise insert footprint into database according to endpoint id , so insert footprints with endpoint ID for specific requested interface
                                    db.db.any('INSERT INTO public.footprint (endpoint_id, subnet_num, mask_num, subnet_ip, prefix) VALUES ($1, $2, $3, $4, $5)', [rmtEndptId, obj.subnetNum, obj.maskNum, obj.subnetIp, obj.prefix])
                                        .then(function (result2) {
                                            callbackCounter++;
                                            // if all footprints were inserted succesfully
                                            if (callbackCounter === footprints.length) {
                                                
                                                redisService.deleteItemAsync("remoteEndpointOrigins:" + rmtEndptId)
                                                    .then(function (found) {
                                                        callbackRedisCounter = 0;
                                                        //for now insert new created services to redis according to ID
                                                        for (var i = 0; i < contentOrigins.length; i++) {
                                                            var obj = contentOrigins[i];

                                                            var conOrig = {
                                                                remoteEndpointLocalId: rmtEndptId,
                                                                name: obj.name,
                                                                originFqdn: obj.originFqdn,
                                                                rfqdn: obj.rfqdn,
                                                                id: obj.id
                                                            };

                                                            var stringObj = JSON.stringify(conOrig);

                                                            redisService.rightPushAsync("remoteEndpointOrigins:" + rmtEndptId, stringObj)
                                                                .then(function (resPush) {
                                                                    callbackRedisCounter++;
                                                                    if (callbackRedisCounter === contentOrigins.length) {
                                                                        db.db.any('UPDATE cdn_interface SET sync = true WHERE id = ($1)',[rmtEndptId])
                                                                        .then(function(resultUpdate){
                                                                            resolve("Success");
                                                                        })
                                                                        .catch(function(err){
                                                                            console.log(err)
                                                                        })
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
                                }
                            })
                            .catch(function (err) {

                            })
                    })
                    .catch(function (err) {
                        //interface not present in database
                        console.log(err)
                    })
            })
        console.log();
    })
}

module.exports = {
    processResponse: processResponse
}