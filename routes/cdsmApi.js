var express = require('express');
var session = require('express-session');
var router = express.Router();

router.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

//CONTENT ORIGINS ROUTES

var ciscoCds = require('../services/ciscoCdsService');
//GET CONTENT ORIGINS
router.get('/getContentOrigins', ciscoCds.getContentOriginsRouter);
//CREATE CONTENT ORIGIN
router.post('/createContentOrigins', ciscoCds.createContentOriginRouter);
//UPDATE CONTENT ORIGIN
router.put('/updateContentOrigins/:originID', ciscoCds.updateContentOrigin);
//DELETE CONTENT ORIGIN
router.delete('/deleteContentOrigins/:originID', ciscoCds.deleteContentOrigin); 

//---------------------------------------------------------------------------------------------------------------------------------------------------
//DELIVERY SERVICES ROUTES
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET DELIVERY SERVICES
router.get('/getDeliveryServices', ciscoCds.getDeliveryServices);

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
                        //console.log(obj.$.Fqdn);
                    }
                    //console.log(response);
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
        //console.log(url);
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
        //console.log(url);
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
        //console.log(url);
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
        //console.log(url);
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
