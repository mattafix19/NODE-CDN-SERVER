var setContentOrigins = function (data, cdsmUrl, rfqdn) {

    return new Promise(function (resolve, reject) {

        var cdsm = require('../routes/cdsmSetList');
        var callbackCounter = 0;

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

            cdsm.createContentOrigin(cdsmUrl, conOrig, rfqdn[i])
                .then(function (result) {
                    cdsm.createDeliveryService(cdsmUrl, result)
                        .then(function (result1) {
                            cdsm.getServiceEngines(cdsmUrl, result1)
                                .then(function (result2) {
                                    var id = result2.ID;
                                    for (var i = 0; i < result2.Devices.length; i++) {
                                        cdsm.assignServiceEngine(cdsmUrl, id, result2.Devices[i].$.id)
                                        .then(function(result3){
                                            console.log("all finised")
                                        })
                                        .catch(function(err){

                                        })
                                    }

                                })
                                .catch(function (err) {

                                })
                        })
                        .catch(function (err) {

                        });
                })
                .catch(function (err) {

                });
        }
    });
}

module.exports = {
    setContentOrigins: setContentOrigins
}