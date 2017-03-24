var db = require("../services/databaseService");
var redisClient = require("../models/redisClient");

//this class is used to get all required information for creating content origins on other side of interconnection
// first of all get from datbase own interface, which is interface with ID = 1
// then according to this interface find corresponding content origins in redis database
// then get all footprints for found record ID from database

var getInterface = function () {
    return new Promise(function (resolve, reject) {
        //get own local interface
        db.getOwnInterface()
            .then(function (result1) {

                var cdsm = require("../services/ciscoCdsService");

                cdsm.getContentOrigins()
                    .then(function (resultContentOrigins) {
                        var obj = resultContentOrigins;
                        db.getFootprintsList(result1[0].id)
                            .then(function (result3) {
                                if (result3.length === 0) {
                                    reject("No footprints for own interface specified")
                                }
                                else {
                                    var retObj = {
                                        ContentOrigins: obj,
                                        Footprints: result3,
                                        Sender: result1[0]
                                    }
                                    resolve(retObj);
                                }
                            })
                            .catch(function (err) {
                                reject(err);
                            })

                    })
            })
            .catch(function (err) {

            })
    })
}

module.exports = {
    getInterface: getInterface
}