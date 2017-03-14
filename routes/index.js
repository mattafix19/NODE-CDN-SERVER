var express = require('express');
var session = require('express-session');
var router = express.Router();
var pg = require('pg');
var path = require('path');

//import database Service
var db = require('../services/databaseService.js');

var connectionString = 'postgres://localhost:5432/Martin'

router.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

/* GET home page. */
router.get('/', function (req, res, next) {


    var user = req.session.login;


    if (user == undefined) {
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else {
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
    }
});

router.get('/afterLogin', function (req, res, next) {
    var user = req.session.login;

    if (user == undefined) {
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
});


//CDNI routes
router.get('/getData', db.getData);
router.get('/getFootprints', db.getFootprints);
router.post('/addFootprints', db.addFootprints);
router.post('/addCdn', db.addCdn);
router.delete('/deleteCDNinterface/:cdnId', db.deleteCDNinterface);



var xmlparser = require('express-xml-bodyparser');
router.post('/CDNTranslationService', xmlparser({ trim: false, explicitArray: false }), function (req, res, next) {
    var soapBody = req.body['soap-env:envelope']['soap-env:body']['cdnutns2:urltranslationrequest'];

    var requestIp = '';			    // ip address of consumer
    var requestIpLong = '';		    // ip address of consumer in long format
    var requestUrl = '';			// full requset url
    var protocol = '';				// protocol that is used in request
    var extension = '';			    // extension of requsted content
    var fqdnWithContent = '';		// help variable
    var fqdn = '';					// will be resault fqdn. On this fqdn we will make redirect
    var content = '';				// piece of URL that point on content
    var originServer = '';			// url origin server
    var originName = '';			// name of origin server which have content
    var endpointRemoteArray = ''; 	// array of endpointRemotes that have footprints which contains requsted IP address

    var redisClient = require('../models/redisClient');
    

    requestIp = soapBody.clientip;
    requestUrl = soapBody.url;
    //"http://rfqdn1.cdn.dampech.tk/"
    var tempArr = requestUrl.split('://');
    //http
    protocol = tempArr[0].slice();
    //rfqdn1.cdn.dampech.tk/
    fqdnWithContent = tempArr[1].slice();

    tempArr = fqdnWithContent.split('/');

    fqdn = tempArr[0].slice();
    
    content = fqdnWithContent.substring(fqdn.length);
    
    if (content != "/") {
        tempArr = content.split('.');
        extension = tempArr[1].slice();
    }

    redisClient.lrangeAsync("rfqdn:" + fqdn, 0 , -1)
    .then(function(found){
        console.log(found);

        var obj = JSON.parse(found);

        originServer = obj.originFqdn;
        originName = obj.name;

        console.log();
    })  
    .catch(function(err){   
        console.log(err);
    })







    console.log(soapBody);
});


//LOGOUT
router.get('/logoutUser', function (req, res, next) {
    req.session.login = undefined;
    res.send("Success");
});


//LOGIN
router.post('/loginUser', function (req, res) {


    req.session.login = req.body.login;

    var results = [];

    var data = {
        login: req.body.login,
        pass: req.body.pass
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users WHERE login=($1) AND pass=($2) AND admin='t';", [data.login, data.pass]);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });

});



//user apis not used
/*
router.post('/api/v1/users', function (req, res) {

    var results = [];

    // Grab data from http request
    var data = {
        login: req.body.login,
        pass: req.body.pass,
        admin: false
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO users (login, pass, admin) values($1, $2, $3)", [data.login, data.pass, data.admin]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });


    });
});

//update user
router.put('/api/v1/users/:users_id', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.users_id;

    // Grab data from http request
    var data = {
        login: req.body.login,
        pass: req.body.pass,
        admin: false
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({ success: false, data: err }));
        }

        // SQL Query > Update Data
        client.query("UPDATE users SET login=($1), pass=($2), admin=($3) WHERE id=($4)", [data.login, data.pass, data.admin, id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });

});

//delete user
router.delete('/api/v1/users/:users_id', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.users_id;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM users WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });

});*/

module.exports = router;