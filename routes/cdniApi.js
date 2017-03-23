var express = require('express');
var session = require('express-session');
var router = express.Router();
var pg = require('pg');
var path = require('path');

var Promise = require('promise');
//var cdniManager = require('CdniManager');

var soap = require('soap');

var www = require('../bin/www');

var Pgb = require("pg-bluebird");
var pgb = new Pgb();

var db = require('../services/databaseService.js');

router.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//localhost 8080
var rfqdn1 = ["rfqdn2.cdn.dampech.tk", "rfqdn3.cdn.dampech.tk", "rfqdn4.cdn.dampech.tk", "rfqdn5.cdn.dampech.tk"];
//localhost 8081
var rfqdn2 = ["rfqdn6.cdn.dampech.tk", "rfqdn7.cdn.dampech.tk", "rfqdn8.cdn.dampech.tk", "rfqdn9.cdn.dampech.tk"];

router.post('/initialOffer', function (req, res, next) {

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
});

router.post('/initialAcceptOffer', function (req, res, next) {

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
});

router.post('/createLists', function (req, res, next) {

    var target = req.body.target;

    // first find all related data for creating interconnection, get content origins, footrpints and sender
    var createListst = require("../routes/createLists");
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
                            Sender: result.Sender
                        }
                    },
                    function (error, response, body) {
                        if (response.body != null) {
                            if (body.status === "Success") {
                                var processList = require('../routes/processRespList');
                                processList.processResponse(body.data)
                                    .then(function (result) {

                                    })
                                    .catch(function (err) {
                                        console.log(err);
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
});

router.delete('/deleteInterconnection/:targetID', function (req, res, next) {
    var id = req.params.targetID;
    db.getOwnInterface()
        .then(function (ownInterface) {
            db.db.any('SELECT * FROM cdn_interface WHERE id = ($1)', id)
                .then(function (foundRemoteInterface) {
                    console.log();
                })
                .catch(function (err) {
                    console.log(err);
                })
        })
        .catch(function (err) {
            console.log(err);
        })
});

router.post('/setLists', function (req, res, next) {
    var url = req.body.Sender.url;
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
                                            var cdsm = require('../routes/setCdsm');
                                            //set content origins on our CDSM
                                            cdsm.setContentOrigins(req.body.ContentOrigins, localInterface[0].url_cdn, rfqdn, remoteEndpointId, remoteEndpointUrl)
                                                .then(function (result) {
                                                    if (result === "Success") {
                                                        var createLists = require('../routes/createLists');
                                                        createLists.getInterface()
                                                            .then(function (listInterfaces) {
                                                                db.db.any('UPDATE cdn_interface SET sync = true where id = ($1)', [remoteEndpointId])
                                                                    .then(function (updated) {
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

});


router.post('/createOffer', db.registerOffer);
router.post('/acceptOffer', db.acceptOffer);


module.exports = router;