var db = require("../services/databaseService");
var redisClient = require("../models/redisClient");


var getInterface = function () {
    return new Promise(function (resolve, reject) {
        //get own local interface
        db.getOwnInterface()
            .then(function (result1) {
                //according to this interface find record in redis, filled after get data function by getContentOrigin 
                redisClient.lrangeAsync("local:" + result1[0].url, 0, -1)
                    .then(function (result2) {
                        console.log(result2);
                        var obj = [];
                        for (var i = 0; i < result2.length; i++) {
                            var parsedString = JSON.parse(result2[i]);
                            obj.push(parsedString);
                        }
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