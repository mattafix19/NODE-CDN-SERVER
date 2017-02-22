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

    //console.log(req);
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

                return db.updateTarget(target,res,next);
            }
        }
    );
});


router.post('/createOffer', db.checkInterface);

module.exports = router;