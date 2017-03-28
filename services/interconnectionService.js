var db = require('../services/databaseService.js');

//localhost 8080
var rfqdn1 = ["rfqdn2.cdn.dampech.tk", "rfqdn3.cdn.dampech.tk", "rfqdn4.cdn.dampech.tk", "rfqdn5.cdn.dampech.tk"];
//localhost 8081
var rfqdn2 = ["rfqdn6.cdn.dampech.tk", "rfqdn7.cdn.dampech.tk", "rfqdn8.cdn.dampech.tk", "rfqdn9.cdn.dampech.tk"];

var initialOffer = function (req, res, next) {
    var senderReq = req.body.sender;
    var target = req.body.target;
    var urlReq = target.url;
    var request = require('request');
    urlSend = "http://" + urlReq + "/cdniApi/createOffer"

    request.post(
        urlSend,
        {
            json: {
                sender: senderReq
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                return db.notifyOffer(target, res, next);
            }
        }
    );
};

var initialAcceptOffer = function (req, res, next) {
    var senderReq = req.body.sender;
    var target = req.body.target;
    var urlReq = target.url;
    var request = require('request');
    urlSend = "http://" + urlReq + "/cdniApi/acceptOffer"

    request.post(
        urlSend,
        {
            json: {
                sender: senderReq
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200 && response.statusCode != 404) {
                console.log(body)
                return db.markValidOffer(target, res, next);
            }
            if (response.statusCode === 404) {
                res.send(response);
            }
        }
    );
};

var createLists = function (req, res, next) {
    var target = req.body.target;

    // first find all related data for creating interconnection, get content origins, footrpints and sender
    var createListst = require("../helpers/createLists");
    createListst.getInterface()
        .then(function (result) {
            //then send data to target
            //target is opposing interface  
            if (result) {
                var target = req.body.target;
                var urlReq = target.url;
                var urlSend = "http://" + urlReq + "/cdniApi/setLists"
                var request = require('request');

                request.post(
                    urlSend,
                    {
                        json: {
                            ContentOrigins: result.ContentOrigins,
                            Footprints: result.Footprints,
                            Sender: result.Sender,
                            remoteEndpointId: target.id

                        }
                    },
                    function (error, response, body) {
                        if (response.body != null) {
                            if (body.status === "Success") {
                                var processList = require('../helpers/processRespList');
                                processList.processResponse(body.data)
                                    .then(function (result) {
                                        res.status(200)
                                            .json({
                                                status: 'Success',
                                                data: 'Successfull set data on remote side',
                                                message: 'Successfull set data on remote side'
                                            });
                                    })
                                    .catch(function (err) {
                                        res.status(500)
                                            .json({

                                            })
                                    })
                            }
                        }
                        else if (!error && response.statusCode == 200 && response.statusCode != 404) {
                            console.log(body)
                        }
                        else if (response.statusCode === 404) {
                            res.send(response);
                        }
                        else if (response.statusCode === 500) {
                            res.send(response);
                        }
                    }
                );
            }
        })
        .catch(function (err) {

        })
};

var setLists = function (req, res, next) {

    var url = req.body.Sender.url;
    var remoteEndpointIdSender = req.body.remoteEndpointId;
    var localInterface = null;

    //load own interface in DB -> ID = 1
    db.getOwnInterface()
        .then(function (localInter) {
            localInterface = localInter;
            //find url from request in database, we must find which record in our database is Requested
            db.db.any('SELECT * from cdn_interface WHERE url=($1)', [url])
                .then(function (result) {
                    //save id and url of record in our database
                    var remoteEndpointId = result[0].id;
                    var remoteEndpointUrl = result[0].url;

                    var rfqdn = null;
                    //resolve rfqdn set which should be next time automate according to DNS
                    if (remoteEndpointUrl == "localhost:8080") {
                        rfqdn = rfqdn1.slice();
                    }
                    else {
                        rfqdn = rfqdn2.slice();
                    }
                    //callback for handlig promise returns in loop with insert to DB
                    var callbackCounter = 0;
                    //if there are no footprints in request, drop
                    if (req.body.Footprints.length === 0) {
                        res.status(404)
                            .json({
                                status: 'failed',
                                message: 'No footprints specified'
                            });
                        return;
                    }
                    db.db.any('DELETE FROM FOOTPRINT WHERE endpoint_id=($1)', [remoteEndpointId])
                        .then(function (resultDeletion) {
                            // loop through all received footprints and get specific information, after call INSERT
                            for (var i = 0; i < req.body.Footprints.length; i++) {

                                var ipUtils = require('ip2long');
                                var long2ip = ipUtils.long2ip;

                                var redisService = require("../services/redisService");
                                var cidr = require('cidr.rb');

                                var network = new cidr.Net(req.body.Footprints[i].subnet_ip + "/" + req.body.Footprints[i].prefix);
                                var netAddressLong = network.netaddr();
                                var netAddress = long2ip(netAddressLong.addr);

                                var subnetNumber = netAddressLong.addr;
                                var maskNumber = network.mask.addr;

                                var obj = {
                                    maskNum: maskNumber,
                                    prefix: req.body.Footprints[i].prefix,
                                    subnetIp: req.body.Footprints[i].subnet_ip,
                                    subnetNum: subnetNumber
                                }

                                var stringified = JSON.stringify(obj);
                                redisService.deleteItem("footprints:" + remoteEndpointId);
                                redisService.rightPush("footprints:" + remoteEndpointId, stringified);

                                //promise insert footprint into database according to endpoint id , so insert footprints with endpoint ID for specific requested interface
                                db.db.any('INSERT INTO public.footprint (endpoint_id, subnet_num, mask_num, subnet_ip, prefix) VALUES ($1, $2, $3, $4, $5)', [remoteEndpointId, obj.subnetNum, obj.maskNum, obj.subnetIp, obj.prefix])
                                    .then(function (result2) {
                                        callbackCounter++;
                                        // if all footprints were inserted succesfully
                                        if (callbackCounter === req.body.Footprints.length) {
                                            callbackCounter = 0;
                                            console.log();
                                            //class which is used to setCDSM with promises
                                            var cdsm = require('../helpers/setCdsm');
                                            //set content origins on our CDSM
                                            cdsm.setContentOrigins(req.body.ContentOrigins, localInterface[0].url_cdn, rfqdn, remoteEndpointId, remoteEndpointUrl)
                                                .then(function (result) {
                                                    if (result === "Success") {
                                                        //update id of our interface which is stored on other side
                                                        redisService.deleteItem("remoteEndpointDownstreamIds:" + remoteEndpointId);
                                                        redisService.rightPush("remoteEndpointDownstreamIds:" + remoteEndpointId, remoteEndpointIdSender);

                                                        var createLists = require('../helpers/createLists');
                                                        createLists.getInterface()
                                                            .then(function (listInterfaces) {
                                                                db.db.any('UPDATE cdn_interface SET sync = true where id = ($1)', [remoteEndpointId])
                                                                    .then(function (updated) {
                                                                        //add to response our local ID of remote upstream interface from which was received request
                                                                        listInterfaces["remoteEndpointId"] = remoteEndpointId;
                                                                        res.status(200)
                                                                            .json({
                                                                                status: 'Success',
                                                                                data: listInterfaces,
                                                                                message: 'Successfull creting remote services'
                                                                            });
                                                                    })
                                                                    .catch(function (err) {
                                                                        console.log(err);
                                                                    })

                                                            })
                                                            .catch(function (err) {
                                                                console.log(err);
                                                            })
                                                    }
                                                })
                                                .catch(function (err) {
                                                    res.status(500)
                                                        .json({
                                                            status: 'Failed',
                                                            data: err,
                                                            message: 'Error while settings one or all content origins on CDSM'
                                                        });
                                                });
                                        }

                                    })
                                    .catch(function (err) {
                                        //could not insert Footprint to database
                                        return next(err);
                                    });
                            }
                        })
                        .catch(function (err) {

                        })

                })
                .catch(function (err) {
                    //could not find interface in DB according to URL
                    return next(err);
                });
        })
        .catch(function (err) {
            //could not find local interface error DB
            console.log(err);
        })
};

var initialDeleteInterconnection = function (req, res, next) {
    var id = req.params.targetID;
    db.getOwnInterface()
        .then(function (ownInterface) {
            db.db.any('SELECT * FROM cdn_interface WHERE id = ($1)', id)
                .then(function (foundRemoteInterface) {
                    if (foundRemoteInterface.length != 0) {
                        var offerStatus = foundRemoteInterface[0].offer_status;
                        var redisService = require('../services/redisService');
                        if (offerStatus === "6") {
                            
                            //delete item from list in remoteEndpointLocalIds so this will stop redirecting
                            redisService.listRemAsync("remoteEndpointLocalIds", 1, foundRemoteInterface[0].id)
                                .then(function (resultDelete) {
                                    console.log(resultDelete);
                                    //delete remoteEndpointOrigins
                                    redisService.deleteItemAsync("remoteEndpointOrigins:" + foundRemoteInterface[0].id)
                                        .then(function (resultDelete2) {
                                            //delete interface footprints
                                            db.db.any('DELETE FROM footprint WHERE endpoint_id = ($1)', [foundRemoteInterface[0].id])
                                                .then(function (removedFootprint) {
                                                    redisService.deleteItemAsync("footprints:" + foundRemoteInterface[0].id)
                                                        .then(function (removedFootprintRedis) {
                                                            //found id interface on other side
                                                            redisService.listRangeAsync("remoteEndpointIds:" + foundRemoteInterface[0].id, 0, -1)
                                                                .then(function (foundRemoteId) {
                                                                    //deleteItem ID
                                                                    redisService.deleteItemAsync("remoteEndpointIds:" + foundRemoteInterface[0].id)
                                                                        .then(function (removeResult) {
                                                                            //send request to delete to other side 
                                                                            var urlSend = "http://" + foundRemoteInterface[0].url + "/cdniApi/deleteInterconnection/" + foundRemoteId
                                                                            var request = require('request');

                                                                            request.delete(
                                                                                urlSend,
                                                                                function (error, response, body) {
                                                                                    if (response.body != null) {
                                                                                        if (body === "ACK") {
                                                                                            res.status(200).send("Received");
                                                                                        }
                                                                                    }
                                                                                    else if (!error && response.statusCode == 200 && response.statusCode != 404) {
                                                                                        console.log(body)
                                                                                    }
                                                                                    else if (response.statusCode === 404) {
                                                                                        res.send(response);
                                                                                    }
                                                                                    else if (response.statusCode === 500) {
                                                                                        res.send(response);
                                                                                    }
                                                                                }
                                                                            );
                                                                        })
                                                                        .catch(function (err) {

                                                                        })
                                                                })
                                                                .catch(function (err) {
                                                                    console.log(err);
                                                                })
                                                        })
                                                        .catch(function (err) {
                                                            console.log(err);
                                                        })
                                                })
                                                .catch(function (err) {
                                                    console.log(err);
                                                })
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                        })
                                })
                                .catch(function (err) {
                                    cinsole.log(err);
                                })
                        }
                        else if (offerStatus === "1") {
                            redisService.listRangeAsync("remoteEndpointDownstreamIds:" + foundRemoteInterface[0].id, 0, -1)
                                .then(function (foundRemoteId) {
                                    //send request to delete to other side 
                                    var urlSend = "http://" + foundRemoteInterface[0].url + "/cdniApi/deleteInterconnectionDownstream/" + foundRemoteId
                                    var request = require('request');

                                    request.delete(
                                        urlSend,
                                        function (error, response, body) {
                                            if (response.body != null) {
                                                if (body === "ACK") {
                                                    deleteInterconnectionFunction(foundRemoteInterface[0].id)
                                                        .then(function (resultDelete) {

                                                            var foundRemoteInterface = resultDelete.interfaceToSend;
                                                            var foundRemoteId = resultDelete.remoteId;

                                                            //send request to remote endpoint
                                                            var urlSend = "http://" + foundRemoteInterface[0].url + "/cdniApi/deleteInterconnectionAccept/" + foundRemoteId
                                                            var request = require('request');

                                                            request.delete(
                                                                urlSend,
                                                                function (error, response, body) {
                                                                    if (response.body != null) {
                                                                        if (body === "ACK") {
                                                                            res.status(200).send("Received");
                                                                        }
                                                                    }
                                                                    else if (!error && response.statusCode == 200 && response.statusCode != 404) {
                                                                        console.log(body)
                                                                    }
                                                                    else if (response.statusCode === 404) {
                                                                        res.send(response);
                                                                    }
                                                                    else if (response.statusCode === 500) {
                                                                        res.send(response);
                                                                    }
                                                                }
                                                            );
                                                        })
                                                        .catch(function (err) {

                                                        })
                                                }
                                            }
                                            else if (!error && response.statusCode == 200 && response.statusCode != 404) {
                                                console.log(body)
                                            }
                                            else if (response.statusCode === 404) {
                                                res.send(response);
                                            }
                                            else if (response.statusCode === 500) {
                                                res.send(response);
                                            }
                                        }
                                    );
                                })
                                .catch(function (err) {
                                    console.log(err);
                                })
                        }
                        else {
                            var obj = {
                                status: 'Failed',
                                data: "FAILED REMOTE INTERFACE IS NOT OFFERED YET",
                                message: "FAILED REMOTE INTERFACE IS NOT OFFERED YET"
                            }
                            res.status(404)
                                .json(obj);
                        }
                    }
                    else {
                        var obj = {
                            status: 'Failed',
                            data: "FAILED REMOTE INTERFACE NOT FOUND",
                            message: "FAILED REMOTE INTERFACE NOT FOUND"
                        }
                        res.status(404)
                            .json(obj);
                    }

                })
                .catch(function (err) {
                    var obj = {
                        status: 'Failed',
                        data: err.message,
                        message: "FAILED DURING RETRIEVING SPECIFIC INTERFACE: " + err.message
                    }
                    res.status(404)
                        .json(obj);
                })
        })
        .catch(function (err) {
            res.json(err);
        })
};

var deleteInterconnectionDownstream = function (req, res, next) {
    var localEndpointId = req.params.interfaceId;
    db.getOwnInterface()
        .then(function (ownInterface) {
            db.db.any('SELECT * FROM cdn_interface WHERE id = ($1)', localEndpointId)
                .then(function (foundRemoteInterface) {
                    if (foundRemoteInterface.length != 0) {
                        var offerStatus = foundRemoteInterface[0].offer_status;
                        var redisService = require('../services/redisService');
                        //delete item from list in remoteEndpointLocalIds so this will stop redirecting
                        redisService.listRemAsync("remoteEndpointLocalIds", 1, foundRemoteInterface[0].id)
                            .then(function (resultDelete) {
                                console.log(resultDelete);
                                //delete remoteEndpointOrigins
                                redisService.deleteItemAsync("remoteEndpointOrigins:" + foundRemoteInterface[0].id)
                                    .then(function (resultDelete2) {
                                        //delete interface footprints
                                        db.db.any('DELETE FROM footprint WHERE endpoint_id = ($1)', [foundRemoteInterface[0].id])
                                            .then(function (removedFootprint) {
                                                redisService.deleteItemAsync("footprints:" + foundRemoteInterface[0].id)
                                                    .then(function (removedFootprintRedis) {
                                                        //found id interface on other side
                                                        redisService.listRangeAsync("remoteEndpointIds:" + foundRemoteInterface[0].id, 0, -1)
                                                            .then(function (foundRemoteId) {
                                                                redisService.deleteItemAsync("remoteEndpointIds:" + foundRemoteInterface[0].id)
                                                                    .then(function (resultDelete) {
                                                                        //send response
                                                                        res.send("ACK");
                                                                    })
                                                                    .catch(function (err) {
                                                                        console.log(err);
                                                                    })
                                                            })
                                                            .catch(function (err) {
                                                                console.log(err);
                                                            })
                                                    })
                                                    .catch(function (err) {
                                                        console.log(err);
                                                    })
                                            })
                                            .catch(function (err) {
                                                console.log(err);
                                            })
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                    })
                            })
                            .catch(function (err) {
                                cinsole.log(err);
                            })


                    }
                    else {
                        var obj = {
                            status: 'Failed',
                            data: "FAILED REMOTE INTERFACE NOT FOUND",
                            message: "FAILED REMOTE INTERFACE NOT FOUND"
                        }
                        res.status(404)
                            .json(obj);
                    }

                })
                .catch(function (err) {
                    var obj = {
                        status: 'Failed',
                        data: err.message,
                        message: "FAILED DURING RETRIEVING SPECIFIC INTERFACE: " + err.message
                    }
                    res.status(404)
                        .json(obj);
                })
        })
        .catch(function (err) {
            res.json(err);
        })
}

var deleteInterconnection = function (req, res, next) {

    var localEndpointId = req.params.interfaceId;
    deleteInterconnectionFunction(localEndpointId)
        .then(function (resultDelete) {
            var foundRemoteInterface = resultDelete.interfaceToSend;
            var foundRemoteId = resultDelete.remoteId;
            //send request to remote endpoint
            var urlSend = "http://" + foundRemoteInterface[0].url + "/cdniApi/deleteInterconnectionAccept/" + foundRemoteId
            var request = require('request');

            request.delete(
                urlSend,
                function (error, response, body) {
                    if (response.body != null) {
                        if (body === "ACK") {
                            res.status(200)
                                .send("ACK");
                        }
                    }
                    else if (!error && response.statusCode == 200 && response.statusCode != 404) {
                        console.log(body)
                    }
                    else if (response.statusCode === 404) {
                        res.send(response);
                    }
                    else if (response.statusCode === 500) {
                        res.send(response);
                    }
                }
            );
        })
        .catch(function (err) {
            console.log(err);
        })
};

var deleteInterconnectionFunction = function (localEndpointId) {
    return new Promise(function (resolve, reject) {
        var cdsm = require('../services/ciscoCdsService');
        var redisService = require('../services/redisService');
        //delete footprints from redis
        redisService.deleteItemAsync("footprints:" + localEndpointId)
            .then(function (deleteResult) {
                //delete footprints from database
                db.db.any("DELETE FROM footprint WHERE endpoint_id = ($1)", [localEndpointId])
                    .then(function (resultDelete) {
                        //get ids of created delivery services
                        redisService.listRangeAsync("remoteEndpointDownstreamDelSer:" + localEndpointId, 0, -1)
                            .then(function (foundDeliveryServices) {
                                var callBackCounter = 0;
                                for (var i = 0; i < foundDeliveryServices.length; i++) {
                                    //foreach delete delivery service according to ID
                                    cdsm.deleteDeliveryServiceFunction(foundDeliveryServices[i])
                                        .then(function (resultDelete) {
                                            callBackCounter++;
                                            if (callBackCounter === foundDeliveryServices.length) {
                                                //get content origins
                                                redisService.listRangeAsync("remoteEndpointDownstream:" + localEndpointId, 0, -1)
                                                    .then(function (foundContentOrigins) {
                                                        var callbackContentOrigins = 0;

                                                        for (var j = 0; j < foundContentOrigins.length; j++) {
                                                            var parsed = JSON.parse(foundContentOrigins[j]);
                                                            //foreach delete content origin
                                                            cdsm.deleteContentOriginFunction(parsed.id)
                                                                .then(function (deleteResult) {
                                                                    callbackContentOrigins++;
                                                                    if (callbackContentOrigins === foundContentOrigins.length) {
                                                                        //delete delivery services and content origins from redis
                                                                        redisService.deleteItem("remoteEndpointDownstreamDelSer:" + localEndpointId);
                                                                        redisService.deleteItem("remoteEndpointDownstream:" + localEndpointId);
                                                                        //find id of remote interface and send request to other side
                                                                        redisService.listRangeAsync("remoteEndpointDownstreamIds:" + localEndpointId, 0, -1)
                                                                            .then(function (foundRemoteId) {
                                                                                //delete ID from redis
                                                                                redisService.deleteItem("remoteEndpointDownstreamIds:" + localEndpointId);
                                                                                //update status to not offered {4}
                                                                                db.db.any("UPDATE cdn_interface SET offer_status = 4, sync = false WHERE id = ($1)", [localEndpointId])
                                                                                    .then(function (resultUpdate) {
                                                                                        //find record in database according to received ID
                                                                                        db.db.any("SELECT * FROM cdn_interface WHERE id = ($1)", [localEndpointId])
                                                                                            .then(function (foundRemoteInterface) {
                                                                                                var obj = {
                                                                                                    interfaceToSend: foundRemoteInterface,
                                                                                                    remoteId: foundRemoteId
                                                                                                }
                                                                                                resolve(obj);
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
                                                                            })
                                                                    }
                                                                })
                                                                .catch(function (err) {
                                                                    console.log(err);
                                                                });
                                                        }
                                                    })
                                                    .catch(function (err) {
                                                        console.log(err);
                                                    })
                                            }
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                        })
                                }
                            })
                            .catch(function (err) {
                                console.log(err)
                            })
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            })
            .catch(function (err) {
                console.log(err);
            })
    })
}

var deleteInterconnectionAccept = function (req, res, next) {
    var id = req.params.interfaceId;
    console.log();
    //update status in database
    db.db.any('UPDATE cdn_interface SET offer_status = 4, sync = false WHERE id = ($1)', [id])
        .then(function (resultUpdate) {
            res.status(200)
                .send("ACK");
        })
        .catch(function (err) {
            console.log(err);
        })
}

module.exports = {
    initialOffer: initialOffer,
    initialAcceptOffer: initialAcceptOffer,
    createLists: createLists,
    setLists: setLists,
    initialDeleteInterconnection: initialDeleteInterconnection,
    deleteInterconnection: deleteInterconnection,
    deleteInterconnectionAccept: deleteInterconnectionAccept,
    deleteInterconnectionDownstream: deleteInterconnectionDownstream
}

