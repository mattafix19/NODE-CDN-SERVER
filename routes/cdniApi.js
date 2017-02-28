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
    secret: 'secret_key'
}));

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
                                            Footprints: footprints
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
    console.log(req);
});

router.post('/createOffer', db.registerOffer);
router.post('/acceptOffer', db.acceptOffer);


module.exports = router;