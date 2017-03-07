var setContentOrigins = function (data, cdsmUrl, rfqdn) {

    return new Promise(function (resolve, reject) {

        var cdsm = require('../routes/cdsmSetList');

        var callbackCounter = 2;
        var recordsCount = data.listing.record.length;

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
                reject("There is no rfqdn left");
            }



            cdsm.createContentOrigin(cdsmUrl, conOrig, rfqdn[i])
                .then(function (result) {
                    cdsm.createDeliveryService(cdsmUrl, result)
                        .then(function (result1) {
                            cdsm.getServiceEngines(cdsmUrl, result1)
                                .then(function (result2) {
                                    var id = result2.ID;

                                    if (result2.Devices.length != 0) {
                                        for (var i = 0; i < result2.Devices.length; i++) {
                                            cdsm.assignServiceEngine(cdsmUrl, id, result2.Devices[i].$.id)
                                                .then(function (result3) {
                                                    callbackCounter++;
                                                    //after successfull setting of all content origins return resolve 
                                                    if (callbackCounter === recordsCount) {
                                                        resolve("Success");
                                                    }
                                                })
                                                .catch(function (err) {
                                                    reject(err);
                                                });
                                            break;
                                        }
                                    }
                                    else {
                                        var obj = {
                                            status: "Error",
                                            operation: "Error, no online delivery services available",
                                            response: result.deliveryserviceProvisioning
                                        }
                                        reject(obj);
                                    }
                                })
                                .catch(function (err) {
                                    reject(err);
                                })
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                })
                .catch(function (err) {
                    reject(err);
                });
        }
    });
}

module.exports = {
    setContentOrigins: setContentOrigins
}