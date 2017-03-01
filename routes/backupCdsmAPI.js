var setContentOrigins = function (data, cdsmUrl) {

    //loop through all content origins of other side
    for (var i = 0, len = data.listing.record.length; i < len; i++) {
        var obj = data.listing.record[i];

        var conOrig = {
            name: obj.$.Name,
            originFqdn: obj.$.OriginFqdn,
            rfqdn: obj.$.Fqdn,
            id: obj.$.Id
        }

        var request = require('request');
        var request = request.defaults({
            strictSSL: false,
            rejectUnauthorized: false
        });

        username = "admin",
            password = "CdnLab_123",
            url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createContentOrigin&name=" + conOrig.name + "&origin=" + conOrig.originFqdn + "&fqdn=" + conOrig.rfqdn,
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
                        for (var i = 0, len = result.listing.record.length; i < len; i++) {
                            var obj = result.listing.record[i];
                            console.log(obj.$.Fqdn);
                        }
                        //console.log(response);
                        return res.json(result);
                    });

                }
            }
        );

    }
}

module.exports = {
    setContentOrigins: setContentOrigins
}