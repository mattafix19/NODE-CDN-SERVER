var redisService = require('../services/redisService');

var translationService = function (req, res, next) {
    
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

    redisService.listRangeAsync("rfqdn:" + fqdn, 0, -1)
        .then(function (foundRfqdn) {

            var deserializedRfqdn = JSON.parse(foundRfqdn);

            originServer = deserializedRfqdn.originFqdn;
            originName = deserializedRfqdn.name;

            redisService.listRangeAsync("remoteInterfaces", 0 ,-1)
            .then(function(foundRemoteInterfaces){

                for (var i = 0; i < foundRemoteInterfaces.length; i++){
                    var interfaceId = foundRemoteInterfaces[i];

                    redisService.listRangeAsync("footprints:" + interfaceId,0,-1)
                    .then(function(foundFootprint){

                        

                        for (var j = 0; j < foundFootprint.length; j++){

                            var deserializedFootprint = JSON.parse(foundFootprint[j]);

                            var subnetIp = deserializedFootprint.subnetIp;
                            var prefix = deserializedFootprint.prefix;
                            var maskNum = deserializedFootprint.maskNum;
                            var subnetNum = deserializedFootprint.subnetNum;

                            console.log();
                        }

                    })
                    .catch(function(err){

                    })
                }


            })
            .catch(function(err){

            });

            console.log();
        })
        .catch(function (err) {
            console.log(err);
        })




    console.log(soapBody);
}


module.exports = {
    translationService:translationService
}
