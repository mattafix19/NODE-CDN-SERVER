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

var connectionString = 'postgres://localhost:5432/Martin'

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
var rfqdn1 = ["rfqdn2.cdn.dampech.tk", "rfqdn3.cdn.dampech.tk", "rfqdn4.cdn.dampech.tk","rfqdn5.cdn.dampech.tk"];
//localhost 8081
var rfqdn2 = ["rfqdn6.cdn.dampech.tk", "rfqdn7.cdn.dampech.tk", "rfqdn8.cdn.dampech.tk","rfqdn9.cdn.dampech.tk"];

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

    var senderReq = req.body.sender;
    var target = req.body.target;

    var urlReq = target.url;

    var request = require('request');


    //get own content origins
    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getContentOrigins&param=all",
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                //console.log(body);
            }
            if (response != null) {
                var parseString = require('xml2js').parseString;
                parseString(response.body, function (err, result) {

                    if (err == null) {

                        var id = senderReq.id;

                        db.db.any('SELECT foot.subnet_num, foot.mask_num, foot.subnet_ip, foot.prefix from cdn_interface as cdn JOIN footprint as foot ON cdn.id = foot.endpoint_id where cdn.id = ($1)', [id])
                            .then(function (result2) {
                                var footprints = [];
                                for (var i = 0; i < result2.length; i++) {
                                    footprints.push(result2[i]);
                                }


                                urlSend = "http://" + urlReq + "/cdniApi/setLists"

                                request.post(
                                    urlSend,
                                    {
                                        json: {
                                            ContentOrigins: result,
                                            Footprints: footprints,
                                            Sender: senderReq
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

                            })
                            .catch(function (err) {
                                return next(err);
                            });
                    }
                });
            }
        }
    );

    //get own capabilities
    //get own dns records
});

router.post('/setLists', function (req, res, next) {
    var url = req.body.Sender.url
    db.db.any('SELECT * from cdn_interface WHERE url=($1)', [url])
        .then(function (result) {
            var endpointId = result[0].id;
            var endpointUrl = result[0].url_cdn;

            var rfqdn = null;

            if (endpointUrl == "localhost:8080") {
                rfqdn = rfqdn1.slice();
            }
            else {
                rfqdn = rfqdn2.slice();
            }

            var callbackCounter = 0;
            for (var i = 0; i < req.body.Footprints.length; i++) {

                var subnetNum = req.body.Footprints[i].subnet_num;
                var maskNum = req.body.Footprints[i].mask_num;
                var prefix = req.body.Footprints[i].prefix;
                var subnetIp = req.body.Footprints[i].subnet_ip;
                callbackCounter++;
                db.db.any('INSERT INTO public.footprint (endpoint_id, subnet_num, mask_num, subnet_ip, prefix) VALUES ($1, $2, $3, $4, $5)', [endpointId, subnetNum, maskNum, subnetIp, prefix])
                    .then(function (result2) {
                        if (callbackCounter === req.body.Footprints.length) {
                            callbackCounter = 0;
                            console.log();
                            var cdsm = require('../routes/backupCdsmAPI');
                            cdsm.setContentOrigins(req.body.ContentOrigins, result[0].url_cdn, rfqdn);
                        }

                    })
                    .catch(function (err) {
                        return next(err);
                    });
            }
        })
        .catch(function (err) {
            return next(err);
        });
});

router.post('/createOffer', db.registerOffer);
router.post('/acceptOffer', db.acceptOffer);


module.exports = router;