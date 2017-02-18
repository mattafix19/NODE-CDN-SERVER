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


var interfaces = [];
var footprints = [];

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//CONTENT ORIGINS ROUTES
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET CONTENT ORIGINS
router.get('/getContentOrigins', function (req, res) {


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
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];
                        console.log(obj.$.Fqdn);
                    }
                    console.log(response);
                    return res.json(result);
                });
            }
        }
    );
});

//CREATE CONTENT ORIGIN
router.post('/createContentOrigin', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createContentOrigin&name=" + req.body.origName + "&origin=" + req.body.origServer + "&fqdn=" + req.body.origFqdnName,
        console.log(url);
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
                return res.json(response);
            }
        }
    );
});

//UPDATE CONTENT ORIGIN
router.post('/updateContentOrigin/:originID', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.originID;

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=modifyContentOrigin&contentOrigin=" + id + "&name=" + req.body.name + "&origin=" + req.body.originFqdn + "&fqdn=" + req.body.rfqdn,
        console.log(url);
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
                console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );

});

//DELETE CONTENT ORIGIN
router.delete('/deleteContentOrigin/:originID', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.originID;

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=deleteContentOrigins&contentOrigin=" + id,
        console.log(url);
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
                console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );

});


//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//DELIVERY SERVICES ROUTES
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET DELIVERY SERVICES
router.get('/getDeliveryServices', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getDeliveryServices&param=all",
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
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];
                        console.log(obj.$.Fqdn);
                    }
                    console.log(response);
                    return res.json(result);
                });
            }
        }
    );
});

//GET SERVICE ENGINES
router.get('/getSE', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getSEs&param=all",
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
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];
                        console.log(obj.$.Fqdn);
                    }
                    console.log(response);
                    return res.json(result);
                });
            }
        }
    );
});

//CREATE DELIVERY SERVICE
router.post('/createDeliveryService', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createDeliveryService&deliveryService=" + req.body.serName + "&contentOrigin=" + req.body.idOrigin,
        console.log(url);
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
                return res.json(response);
            }
        }
    );
});

//DELETE DELIVERY SERVICE
router.delete('/deleteDeliveryService/:ID', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.ID;

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=deleteDeliveryServices&deliveryService=" + id,
        console.log(url);
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
                console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );

});

//ASSIGN SERVICE ENGINE
router.post('/assignSE', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=assignSEs&deliveryService=" + req.body.delSerID + "&contentAcquirer=" + req.body.seID + "&se=" + req.body.seID,
        console.log(url);
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
                return res.json(response);
            }
        }
    );
});

//UNASSIGN SERVICE ENGINE
router.post('/unAssignSE', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=unassignSEs&deliveryService=" + req.body.delSerID + "&se=all",
        console.log(url);
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
                return res.json(response);
            }
        }
    );
});

module.exports = router;