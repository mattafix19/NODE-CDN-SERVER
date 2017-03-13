//CREATE CONTENT ORIGIN
var createContentOrigin = function (cdsmUrl, conOrig, rfqdn) {
    return new Promise(function (resolve, reject) {
        var request = require('request');
        var request = request.defaults({
            strictSSL: false,
            rejectUnauthorized: false
        });

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
                                status: "Error",
                                operation: "Error while creating content origin",
                                response: result.deliveryserviceProvisioning
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
        var request = require('request');
        var request = request.defaults({
            strictSSL: false,
            rejectUnauthorized: false
        });

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
                                status: "Error",
                                operation: "Error while creating delivery service",
                                response: result.deliveryserviceProvisioning
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
var getServiceEngines = function (cdsmUrl, id) {

    return new Promise(function (resolve, reject) {
        var request = require('request');
        var request = request.defaults({
            strictSSL: false,
            rejectUnauthorized: false
        });

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
                                status: "Error",
                                operation: "Error while getting list of service engines",
                                response: result.listing
                            }
                            reject(obj);
                        }
                        else {
                            for (var i = 0, len = result.listing.device.length; i < len; i++) {
                                if (result.listing.device[i].$.status != "Offline") {
                                    devices.push(result.listing.device[i]);
                                }
                            }
                            console.log(devices);
                            var assignCounter = 0;

                            var obj = {
                                ID: id,
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
        var request = require('request');
        var request = request.defaults({
            strictSSL: false,
            rejectUnauthorized: false
        });

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

                    resolve("OK");

                };


            }
        );
    });

};

//GET CONTENT ORIGINS 
var getContentOrigins = function () {
    return new Promise(function (resolve, reject) {


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
                    var arrContentOrigins = []

                    var parseString = require('xml2js').parseString;
                    parseString(response.body, function (err, result) {

                        for (var i = 0; i < result.listing.record.length; i++) {
                            var obj = result.listing.record[i];

                            var conOrig = {
                                name: obj.$.Name,
                                originFqdn: obj.$.OriginFqdn,
                                rfqdn: obj.$.Fqdn,
                                id: obj.$.Id
                            };

                            arrContentOrigins.push(conOrig);
                        }
                        //console.log(response);
                        resolve(arrContentOrigins);
                    });
                }
                reject("Failed");
            }
        );
    });
}


module.exports = {
    createContentOrigin: createContentOrigin,
    createDeliveryService: createDeliveryService,
    getServiceEngines: getServiceEngines,
    assignServiceEngine: assignServiceEngine,
    getContentOrigins: getContentOrigins 
}