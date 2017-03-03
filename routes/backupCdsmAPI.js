var setContentOrigins = function (data, cdsmUrl, rfqdn) {

    //because for can be called only one time there is this hack used
    //loop through all content origins of other side
    for (var i = 0, len = data.listing.record.length; i < len; i++) {

        var obj = data.listing.record[i];

        var conOrig = {
            name: obj.$.Name,
            originFqdn: obj.$.OriginFqdn,
            rfqdn: obj.$.Fqdn,
            id: obj.$.Id
        };

        if (rfqdn.length === 0) {
            //return no rfqdn available 
        }


        var request = require('request');
        var request = request.defaults({
            strictSSL: false,
            rejectUnauthorized: false
        });

        username = "admin",
            password = "CdnLab_123",
            url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createContentOrigin&name=" + conOrig.name + "&origin=" + conOrig.originFqdn + "&fqdn=" + rfqdn[i],
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

                        }
                        else {
                            var id = result.deliveryserviceProvisioning.record[0].$.Id;
                            var name = result.deliveryserviceProvisioning.record[0].$.Name;

                            console.log(id);

                            username = "admin",
                                password = "CdnLab_123",
                                url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createDeliveryService&deliveryService=" + name + "&contentOrigin=" + id,
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

                                            }
                                            else {
                                                var id = result.deliveryserviceProvisioning.record[0].$.Id;
                                                console.log(id);

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

                                                                }
                                                                else {
                                                                    for (var i = 0, len = result.listing.device.length; i < len; i++) {
                                                                        if (result.listing.device[i].$.status != "Offline") {
                                                                            devices.push(result.listing.device[i]);
                                                                        }
                                                                    }
                                                                    console.log(devices);

                                                                    for (var i = 0; i < devices.length ; i++){

                                                                    }

                                                                }


                                                            });
                                                        }
                                                    }
                                                );

                                            }
                                        });
                                    }

                                }
                            );


                        }
                    });

                }
            }
        );
        //end for
    }
}

module.exports = {
    setContentOrigins: setContentOrigins
}