var express = require('express');
var session = require('express-session');
var router = express.Router();
var pg = require('pg');
var path = require('path');
//var cdniManager = require('CdniManager');

var soap = require('soap');

var www = require('../bin/www');

var Pgb = require("pg-bluebird");
var pgb = new Pgb();

//var cdniMan = new cdniManager(pgb);

//var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432';
var connectionString = 'postgres://localhost:5432/Martin'

router.use(session({
    secret: 'secret_key'
}));

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var interfaces = [];
var footprints = [];

router.post('/initialOffer', function (req, res, next) {
    
    console.log(req);

    console.log("received");

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });
        url = "http://localhost:8081/createOffer"
    
    request(
        {
            url: url,
        },
        function (error, response, body) {
            if (error != null || body != null) {
                console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );

});

module.exports = router;