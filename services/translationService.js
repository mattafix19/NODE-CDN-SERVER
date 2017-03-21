var redisService = require('../services/redisService');
var ipUtils = require('ip2long');
var ip2long = ipUtils.ip2long;
var cidr = require('cidr.rb');

var translationService = function (req, res, next) {
    console.time("handleTime");
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

    var finalFqdn = '';

    requestIp = soapBody.clientip;
    requestIPv4 = new cidr.IPv4(requestIp);
    requestIpLong = requestIPv4.addr;
    requestUrl = soapBody.url;



    //http://rfqdn1.cdn.dampech.tk/img/hamster_dramatic_look.jpg
    var tempArr = requestUrl.split('://');
    //http
    protocol = tempArr[0].slice();
    //rfqdn1.cdn.dampech.tk/img/hamster_dramatic_look.jpg
    fqdnWithContent = tempArr[1].slice();
    //rfqdn1.cdn.dampech.tk img hamster_dramatic_look.jpg
    tempArr = fqdnWithContent.split('/');
    //rfqdn1.cdn.dampech.tk
    fqdn = tempArr[0].slice();
    //img/hamster_dramatic_look.jpg
    content = fqdnWithContent.substring(fqdn.length);
    //check if there is content if it is split according to . (without content there is only / at the end)
    if (content != "/") {
        //img/hamster_dramatic_look.jpg
        tempArr = content.split('.');
        //jpg
        extension = tempArr[1].slice();
    }

    //find parsed fqdn in redis where key is rfqdn:{{fqdn}}

    redisService.listRangeAsync("rfqdn:" + fqdn, 0, -1)
        .then(function (foundRfqdn) {

            var deserializedRfqdn = JSON.parse(foundRfqdn);

            originServer = deserializedRfqdn.originFqdn;
            originName = deserializedRfqdn.name;
            //get all IDs of remote interfaces saved in redis database
            redisService.listRangeAsync("remoteInterfaces", 0, -1)
                .then(function (foundRemoteInterfaces) {

                    var foundFootprintsMatches = [];
                    var footprintsCallbacks = 0;
                    //loop through all found remote interfaces
                    for (var i = 0; i < foundRemoteInterfaces.length; i++) {

                        var interfaceId = foundRemoteInterfaces[i];
                        //for each of interface find footprints
                        redisService.listRangeAsync("footprints:" + interfaceId, 0, -1)
                            .then(function (foundFootprint) {
                                footprintsCallbacks++;
                                //after found of footprints of specific interface
                                for (var j = 0; j < foundFootprint.length; j++) {

                                    var deserializedFootprint = JSON.parse(foundFootprint[j]);

                                    var endpointId = deserializedFootprint.endpointId;
                                    var subnetIp = deserializedFootprint.subnetIp;
                                    var prefix = deserializedFootprint.prefix;
                                    var maskNum = deserializedFootprint.maskNum;
                                    var subnetNum = deserializedFootprint.subnetNum;
                                    // check of IP address match
                                    if (requestIpLong >= Number(subnetNum) && requestIpLong < (Number(subnetNum) + (Number(ip2long('255.255.255.255')) - Number(maskNum)))) {
                                        var obj = {
                                            remoteEndpointId: endpointId,
                                            subnetNumber: subnetNum,
                                            prefix: prefix,
                                            fqdn: ""
                                        }
                                        //add match into array
                                        foundFootprintsMatches.push(obj);
                                    }
                                }
                                // check if were all interfaces done if so, continue
                                if (footprintsCallbacks === foundRemoteInterfaces.length) {
                                    var remoteEndCallback = 0;
                                    var higherPrefix = 0;
                                    //loop through all matched records in remote interface footprints
                                    for (var k = 0; k < foundFootprintsMatches.length; k++) {
                                        redisService.listRangeAsync('remoteEndpoint:' + foundFootprintsMatches[k].remoteEndpointId, 0, -1)
                                            .then(function (foundRemoteEndpoint) {
                                                remoteEndCallback++;

                                                for (var l = 0; l < foundRemoteEndpoint.length; l++) {
                                                    var parsedRemoteEndpoint = JSON.parse(foundRemoteEndpoint[l]);

                                                    var name = parsedRemoteEndpoint.name;
                                                    var originFqdn = parsedRemoteEndpoint.originFqdn;
                                                    var rfqdn = parsedRemoteEndpoint.rfqdn;
                                                    var remoteEndpointIdAct = parsedRemoteEndpoint.remoteEndpointId;

                                                    if (name === originName && originFqdn === originServer) {
                                                        for (var i = 0; i < foundFootprintsMatches.length; i++) {
                                                            if (foundFootprintsMatches[i].remoteEndpointId === remoteEndpointIdAct) {
                                                                foundFootprintsMatches[i].fqdn = rfqdn;
                                                                if (foundFootprintsMatches[i].prefix > higherPrefix) {
                                                                    higherPrefix = foundFootprintsMatches[i].prefix;
                                                                    finalFqdn = foundFootprintsMatches[i].fqdn;
                                                                }
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                                //if all callback of found remote endpoint were processed then there is last check of prefixes
                                                //there can be multiple remote interfaces which can handle request
                                                //we must specify according to prefix
                                                if (remoteEndCallback === foundFootprintsMatches.length) {
                                                    if (content != "/") {
                                                        var finalUrl = protocol + "://" + finalFqdn + content;
                                                    }
                                                    else {
                                                        var finalUrl = protocol + "://" + finalFqdn
                                                    }

                                                    res.set('Content-Type', 'text/xml');

                                                    var builder = require('xmlbuilder');
                                                    var xml = builder.create('SOAP-ENV:Envelope', { version: '1.0', encoding: 'UTF-8' })
                                                        .att('xmlns:SOAP-ENV', 'http://schemas.xmlsoap.org/soap/envelope/')
                                                        .att('xmlns:SOAP-ENC', 'http://schemas.xmlsoap.org/soap/encoding/')
                                                        .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
                                                        .att('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema')
                                                        .att('xmlns:CDNUTNS1', 'http://cisco/CDS/CDNUrlTranslation')
                                                        .att('xmlns:CDNUTNS2', 'http://schemas.cisco/CDS/CDNUrlTranslation/Schema')
                                                        .ele('SOAP-ENV:Body')
                                                        .ele('CDNUTNS2:UrlTranslationResponse')
                                                        .ele('TranslatedUrl', finalUrl)
                                                        .up()
                                                        .ele('SignUrl', 'false')
                                                        .end({ pretty: true });

                                                    console.log(xml);

                                                    res.send(xml);
                                                    console.timeEnd("handleTime");
                                                }


                                            })
                                            .catch(function (err) {
                                                console.log(err)
                                            })
                                    }
                                }
                                console.log();

                            })
                            .catch(function (err) {

                            })
                    }


                })
                .catch(function (err) {

                });

            console.log();
        })
        .catch(function (err) {
            console.log(err);
        })




    console.log(soapBody);
}
//saved working response to cisco CDS
/*
res.set('Content-Type', 'text/xml');

    var builder = require('xmlbuilder');
    var xml = builder.create('SOAP-ENV:Envelope',{version: '1.0', encoding: 'UTF-8'})
        .att('xmlns:SOAP-ENV','http://schemas.xmlsoap.org/soap/envelope/')
        .att('xmlns:SOAP-ENC','http://schemas.xmlsoap.org/soap/encoding/')
        .att('xmlns:xsi','http://www.w3.org/2001/XMLSchema-instance')
        .att('xmlns:xsd','http://www.w3.org/2001/XMLSchema')
        .att('xmlns:CDNUTNS1','http://cisco/CDS/CDNUrlTranslation')
        .att('xmlns:CDNUTNS2','http://schemas.cisco/CDS/CDNUrlTranslation/Schema')
        .ele('SOAP-ENV:Body')
            .ele('CDNUTNS2:UrlTranslationResponse')
                .ele('TranslatedUrl','rfqdn1.cdn.wayl.tk')
                .up()
                .ele('SignUrl','false')
        .end({ pretty: true});

    console.log(xml);

    res.send(xml);
*/

module.exports = {
    translationService: translationService
}
