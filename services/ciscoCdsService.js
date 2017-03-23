var request = require('request');
var request = request.defaults({
    strictSSL: false,
    rejectUnauthorized: false
});

//CREATE CONTENT ORIGIN
var createContentOrigin = function (cdsmUrl, conOrig, rfqdn) {
    return new Promise(function (resolve, reject) {

        username = "admin",
            password = "CdnLab_123",
            url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createContentOrigin&name=" + conOrig.name + "&origin=" + conOrig.originFqdn + "&fqdn=" + rfqdn,
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
                if (response != null) {

                    var parseString = require('xml2js').parseString;
                    parseString(response.body, function (err, result) {
                        if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                            var obj = {
                                status: "Failed",
                                data: result.deliveryserviceProvisioning.error[0].$.message,
                                message: result.deliveryserviceProvisioning.error[0].$.message
                            }
                            reject(obj);
                        }
                        else {
                            var id = result.deliveryserviceProvisioning.record[0].$.Id;
                            var name = result.deliveryserviceProvisioning.record[0].$.Name;
                            var originFqdn = result.deliveryserviceProvisioning.record[0].$.OriginFqdn;
                            var fqdn = result.deliveryserviceProvisioning.record[0].$.Fqdn;

                            var obj = {
                                ID: id,
                                Name: name,
                                OriginFqdn: originFqdn,
                                Fqdn: fqdn
                            }
                            resolve(obj);
                        }
                    });
                }
            }
        );
    });

};

//CREATE DELIVERY SERVICE
var createDeliveryService = function (cdsmUrl, obj) {
    return new Promise(function (resolve, reject) {
        username = "admin",
            password = "CdnLab_123",
            url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createDeliveryService&deliveryService=" + obj.Name + "&contentOrigin=" + obj.ID,
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
                if (response != null) {
                    var parseString = require('xml2js').parseString;
                    parseString(response.body, function (err, result) {
                        if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                            var obj = {
                                status: "Failed",
                                data: result.deliveryserviceProvisioning.message[0].$.message,
                                message: result.deliveryserviceProvisioning.message[0].$.message
                            }
                            reject(obj);
                        }
                        else {
                            var id = result.deliveryserviceProvisioning.record[0].$.Id;
                            resolve(id);
                        }
                    });
                }
            }
        );
    });

};

//GET SERVICE ENGINES
var getServiceEngines = function (cdsmUrl) {

    return new Promise(function (resolve, reject) {
        //call get SE DEVICES 
        username = "admin",
            password = "CdnLab_123",
            url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.DeviceApiServlet?action=getDevices&type=SE",
            auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

        request(
            {
                url: url,
                headers: {
                    "Authorization": auth
                }
            },
            function (error, response, body) {
                if (response != null) {
                    var devices = [];
                    var parseString = require('xml2js').parseString;
                    parseString(response.body, function (err, result) {
                        if (result.listing.message[0].$.status === "fail") {
                            var obj = {
                                status: "Failed",
                                data: result.listing.message[0].$.message,
                                message: result.listing.message[0].$.message
                            }
                            reject(obj);
                        }
                        else {
                            for (var i = 0, len = result.listing.device.length; i < len; i++) {
                                if (result.listing.device[i].$.status != "Offline") {
                                    devices.push(result.listing.device[i]);
                                }
                            }
                            var assignCounter = 0;

                            var obj = {
                                Devices: devices
                            }
                            resolve(obj);
                        }
                    });
                }
                if (error) {
                    reject(error);
                }
            }
        );
    });

};

//ASSIGN SERVICE ENGINE
var assignServiceEngine = function (cdsmUrl, id, deviceId) {
    return new Promise(function (resolve, reject) {
        username = "admin",
            password = "CdnLab_123",
            url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=assignSEs&deliveryService=" + id + "&contentAcquirer=" + deviceId + "&se=" + deviceId,
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
                if (response != null) {
                    var parseString = require('xml2js').parseString;
                    parseString(response.body, function (err, result) {
                        if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                            var obj = {
                                status: "Failed",
                                data: result.deliveryserviceProvisioning.message[0].$.message,
                                message: result.deliveryserviceProvisioning.message[0].$.message
                            }
                            reject(obj);
                        }
                        else {
                            var id = result.deliveryserviceProvisioning.record[0].$.Id;
                            resolve(id);
                        }
                    });
                }


            }
        );
    });
};

//GET CONTENT ORIGINS FROM OWN INTERFACE FOR OUR CDSM
//update rfqdn in redis database
//update localEndpoint records in redis database
var getContentOrigins = function () {
    return new Promise(function (resolve, reject) {

        var db = require('../services/databaseService');
        // get own local interface -> ID = 1
        db.getOwnInterface()
            .then(function (localEndpoint) {
                // send CDSM request for content origins according to selected own interface
                username = "admin",
                    password = "CdnLab_123",
                    url = localEndpoint[0].url_cdn + ":" + localEndpoint[0].port_cdn + "/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getContentOrigins&param=all",
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
                            var arrContentOrigins = []

                            var parseString = require('xml2js').parseString;
                            parseString(response.body, function (err, result) {
                                //updateRedis db on key localEndpoint
                                var redisClient = require('../models/redisClient');
                                var redisService = require('../services/redisService');
                                redisService.existAsync("localEndpoint")
                                    .then(function (res) {
                                        redisService.deleteItemAsync("localEndpoint")
                                            .then(function (resultDelete) {
                                                callbackRedisCounter = 0;

                                                // delete from redis all records contains rfqdn: *
                                                redisService.evalItem("return redis.call('del', 'defaultKey', unpack(redis.call('keys', ARGV[1])))", 0, "rfqdn:*");
                                                if (result.listing.record.length === 0) {
                                                    reject("Failed");
                                                }

                                                for (var i = 0; i < result.listing.record.length; i++) {
                                                    var obj = result.listing.record[i];

                                                    var conOrig = {
                                                        name: obj.$.Name,
                                                        originFqdn: obj.$.OriginFqdn,
                                                        rfqdn: obj.$.Fqdn,
                                                        id: obj.$.Id
                                                    };
                                                    arrContentOrigins.push(conOrig);
                                                    var stringObj = JSON.stringify(conOrig);

                                                    var rfqdn = {
                                                        name: obj.$.Name,
                                                        originFqdn: obj.$.OriginFqdn,
                                                        id: obj.$.Id
                                                    }

                                                    var stringRfqdn = JSON.stringify(rfqdn);

                                                    redisService.rightPush("rfqdn:" + conOrig.rfqdn, stringRfqdn)

                                                    //push records to end of list
                                                    redisService.rightPushAsync("localEndpoint", stringObj)
                                                        .then(function (resultLpush) {
                                                            callbackRedisCounter++;
                                                            if (callbackRedisCounter === result.listing.record.length) {
                                                                resolve(arrContentOrigins);
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


                                    })
                                    .catch(function (err) {
                                        console.log(err)
                                    })

                            });
                        }
                    }
                );
            })
            .catch(function (err) {
                console.log(err);
            })
    });
}

var getContentOriginsRouter = function (req, res, next) {
    getContentOrigins()
        .then(function (result) {
            res.status(200)
                .json({
                    status: 'Success',
                    data: result,
                    message: 'Retrieved all content origins success'
                });
        })
        .catch(function (err) {
            res.status(404)
                .json({
                    status: err,
                    data: "undefined",
                    message: 'Retrieved all content origins failed, no content origins found'
                });
        })
}

var createContentOriginRouter = function (req, res, next) {
    var obj = {
        name: req.body.origName,
        originFqdn: req.body.origServer
    }
    createContentOrigin("https://cdsm.cdn.ab.sk", obj, req.body.origFqdnName)
        .then(function (result) {
            res.status(200)
                .json({
                    status: 'Success',
                    data: result,
                    message: 'Creating content origin success'
                });
        })
        .catch(function (err) {
            res.status(404)
                .json(err);
        })
}

var updateContentOrigin = function (req, res, next) {
    var results = [];

    // Grab data from the URL parameters
    var id = req.params.originID;
    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=modifyContentOrigin&contentOrigin=" + id + "&name=" + req.body.name + "&origin=" + req.body.originFqdn + "&fqdn=" + req.body.rfqdn,
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
            var parseString = require('xml2js').parseString;

            if (error) {
                res.status(404)
                    .json({
                        status: 'Failed',
                        data: error,
                        message: 'Update content origin failed'
                    });
            }
            parseString(response.body, function (err, result) {
                if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                    res.status(404)
                        .json({
                            status: 'Failed',
                            data: result.deliveryserviceProvisioning.error[0].$.message,
                            message: result.deliveryserviceProvisioning.error[0].$.message
                        });
                }
                else {
                    res.status(200)
                        .json({
                            status: 'Success',
                            data: result.deliveryserviceProvisioning,
                            message: 'Update content origin success'
                        });
                }
            });
        }
    );

}

var deleteContentOrigin = function (req, res, next) {
    var results = [];

    // Grab data from the URL parameters
    var id = req.params.originID;

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=deleteContentOrigins&contentOrigin=" + id,
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
            var parseString = require('xml2js').parseString;

            if (error) {
                res.status(404)
                    .json({
                        status: 'Failed',
                        data: error,
                        message: 'Delete content origin failed'
                    });
            }
            parseString(response.body, function (err, result) {
                if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                    res.status(404)
                        .json({
                            status: 'Failed',
                            data: result.deliveryserviceProvisioning.error[0].$.message,
                            message: result.deliveryserviceProvisioning.error[0].$.message
                        });
                }
                else {
                    res.status(200)
                        .json({
                            status: 'Success',
                            data: result.deliveryserviceProvisioning,
                            message: 'Delete content origin success'
                        });
                }
            });
        }
    );
}

var getDeliveryServices = function (req, res, next) {
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
            var parseString = require('xml2js').parseString;

            if (error) {
                res.status(404)
                    .json({
                        status: 'Failed',
                        data: error,
                        message: 'Get delivery services failed'
                    });
            }
            parseString(response.body, function (err, result) {
                if (result.listing.message[0].$.status === "fail") {
                    res.status(404)
                        .json({
                            status: 'Failed',
                            data: result.listing.message[0].$.message,
                            message: result.listing.message[0].$.message
                        });
                }
                else {
                    var arrContentOrigins = [];
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];


                        var contentOrigin = {
                            name: obj.$.Name,
                            originFqdn: obj.$.OriginFqdn,
                            rfqdn: obj.$.Fqdn,
                            id: obj.$.Id,
                            originID: obj.$.ContentOriginId,
                            seID: obj.$.ContentAcquirer
                        }
                        arrContentOrigins.push(contentOrigin)

                    }
                    res.status(200)
                        .json({
                            status: 'Success',
                            data: arrContentOrigins,
                            message: 'Get delivery services success'
                        });
                }
            });
        }
    );
}

var getServiceEnginesRouter = function (req, res, next) {
    getServiceEngines('https://cdsm.cdn.ab.sk')
        .then(function (result) {
            var arrdevices = result.Devices;
            var arrDevicesFinal = [];

            for (var i = 0, len = arrdevices.length; i < len; i++) {
                var obj = arrdevices[i].$;
                var contentOrigin = {
                    name: obj.name,
                    id: obj.id
                }
                arrDevicesFinal.push(contentOrigin)

            }
            res.status(200)
                .json({
                    status: 'Success',
                    data: arrDevicesFinal,
                    message: 'Retrieved all delivery services success'
                });
        })
        .catch(function (err) {
            res.status(404)
                .json(err);
        })
}

var createDeliveryServiceRouter = function (req, res, next) {
    var obj = {
        Name: req.body.serName,
        ID: req.body.idOrigin
    }
    createDeliveryService("https://cdsm.cdn.ab.sk", obj)
        .then(function (result) {
            res.status(200)
                .json({
                    status: 'Success',
                    data: result,
                    message: 'Creating delivery service successfull'
                });
        })
        .catch(function (err) {
            res.status(404)
                .json(err);
        })
}

var deleteDeliveryService = function (req, res, next) {
    var results = [];
    // Grab data from the URL parameters
    var id = req.params.ID;
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
            var parseString = require('xml2js').parseString;

            if (error) {
                res.status(404)
                    .json({
                        status: 'Failed',
                        data: error,
                        message: 'Delete delivery service failed'
                    });
            }
            parseString(response.body, function (err, result) {
                if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                    res.status(404)
                        .json({
                            status: 'Failed',
                            data: result.deliveryserviceProvisioning.error[0].$.message,
                            message: result.deliveryserviceProvisioning.error[0].$.message
                        });
                }
                else {
                    res.status(200)
                        .json({
                            status: 'Success',
                            data: result.deliveryserviceProvisioning,
                            message: 'Delete delivery service success'
                        });
                }
            });
        }
    );
}

var assignServiceEngineRouter = function (req, res, next) {
    assignServiceEngine('https://cdsm.cdn.ab.sk', req.body.delSerID, req.body.seID)
        .then(function (result) {
            res.status(200)
                .json({
                    status: 'Success',
                    data: result,
                    message: 'Assigning service engine successfull'
                });
        })
        .catch(function (err) {
            res.status(404)
                .json(err);
        })

}

var unassignServiceEngine = function (req, res, next) {
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
            var parseString = require('xml2js').parseString;

            if (error) {
                res.status(404)
                    .json({
                        status: 'Failed',
                        data: error,
                        message: 'Unassign service engine failed'
                    });
            }
            parseString(response.body, function (err, result) {
                if (result.deliveryserviceProvisioning.message[0].$.status === "fail") {
                    res.status(404)
                        .json({
                            status: 'Failed',
                            data: result.deliveryserviceProvisioning.error[0].$.message,
                            message: result.deliveryserviceProvisioning.error[0].$.message
                        });
                }
                else {
                    res.status(200)
                        .json({
                            status: 'Success',
                            data: result.deliveryserviceProvisioning,
                            message: 'Unassign service engine success'
                        });
                }
            });
        }
    );
}


module.exports = {
    createContentOrigin: createContentOrigin,
    createDeliveryService: createDeliveryService,
    getServiceEngines: getServiceEngines,
    assignServiceEngine: assignServiceEngine,
    getContentOrigins: getContentOrigins,
    getContentOriginsRouter: getContentOriginsRouter,
    createContentOriginRouter: createContentOriginRouter,
    updateContentOrigin: updateContentOrigin,
    deleteContentOrigin: deleteContentOrigin,
    getDeliveryServices: getDeliveryServices,
    getServiceEnginesRouter: getServiceEnginesRouter,
    createDeliveryServiceRouter: createDeliveryServiceRouter,
    deleteDeliveryService: deleteDeliveryService,
    assignServiceEngineRouter: assignServiceEngineRouter,
    unassignServiceEngine: unassignServiceEngine
}