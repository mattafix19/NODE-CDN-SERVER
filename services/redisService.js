var bluebird = require("bluebird");

var redis = require('redis'),
    client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


var deleteItemAsync = function (key) {
    return new Promise(function (resolve, reject) {
        client.del(key, function (err, res) {
            if (res === 0 || res === 1) {
                resolve(res);
            }
            else {
                reject(err);
            }
        });
    });
}

var deleteItem = function (key) {
    client.del(key, function (err, res) {
        console.log(res);
    });
}

var evalItem = function (call, number, data) {
    client.eval(call, number, data, function (err, res) {
        console.log(err);
        console.log(res);
    });
}

var rightPush = function (key, value) {
    client.rpush(key, value, function (err, res) {
        console.log(res);
    });
}

var rightPushAsync = function (key, value) {
    return new Promise(function (resolve, reject) {
        client.rpush(key, value, function (err, res) {
            if (res) {
                resolve(res);
            }
            else {
                reject(err);
            }
        });
    });
}

var set = function (key, value) {
    client.set(key, value, function (err, res) {
        console.log(res);
    });
}

var existAsync = function (key){
    return new Promise(function (resolve, reject) {
        client.exists(key, function(err,res){
            if (res === 0 || res === 1){
                resolve(res);
            }
            else{
                reject(err)
            } 
        })
    });
}



module.exports = {
    deleteItem: deleteItem,
    deleteItemAsync: deleteItemAsync,
    evalItem: evalItem,
    rightPush: rightPush,
    rightPushAsync: rightPushAsync,
    set:set,
    existAsync:existAsync
}