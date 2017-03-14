var bluebird = require("bluebird");

var redis = require('redis'),
    client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


var deleteItemAsync = function (data) {
    return new Promise(function (resolve, reject) {
        client.del(data, function (err, res) {
            if (res) {
                resolve(res);
            }
            else {
                reject(err);
            }
        });
    });
}

var deleteItem = function (data) {
    client.del(data, function (err, res) {
        console.log(res);
    });
}

var evalItem = function (call,number,data) {
    redisClient.eval(call, number, data, function (err, res) {
        console.log(err);
        console.log(res);
    });
}




module.exports = {
    deleteItem: deleteItem,
    deleteItemAsync: deleteItemAsync,
    evalItem: evalItem
}