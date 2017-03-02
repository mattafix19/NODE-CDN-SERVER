var setContentOrigins = function (data, cdsmUrl, rfqdn) {

    
    //because for can be called only one time there is this hack used
    var j = -1;

    //loop through all content origins of other side
    for (var i = 0, len = data.listing.record.length; i < len; i++) {

        j++;

        var obj = data.listing.record[i];

        var conOrig = {
            name: obj.$.Name,
            originFqdn: obj.$.OriginFqdn,
            rfqdn: obj.$.Fqdn,
            id: obj.$.Id
        };

        if (rfqdn.length === 0){
            //return no rfqdn available 
        }

        for (j; j < rfqdn.length; j++) {

            var request = require('request');
            var request = request.defaults({
                strictSSL: false,
                rejectUnauthorized: false
            });

            username = "admin",
                password = "CdnLab_123",
                url = cdsmUrl + ":8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createContentOrigin&name=" + conOrig.name + "&origin=" + conOrig.originFqdn + "&fqdn=" + rfqdn[j],
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

                                
                                

                            }
                        });

                    }
                }
            );
            break;
        //end for
        }

    }
}

module.exports = {
    setContentOrigins: setContentOrigins
}