var bluebird = require("bluebird");

var redis = require('redis'),
    client = redis.createClient(6379);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


var deleteItemAsync = function (key) {
    return new Promise(function (resolve, reject) {
        client.del(key, function (err, res) {
            if (err === undefined){
                reject(err);
            }
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
            if (err === undefined) {
                reject(err);
            }
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

var existAsync = function (key) {
    return new Promise(function (resolve, reject) {
        client.exists(key, function (err, res) {
            if (err === undefined) {
                reject(err);
            }
            if (res === 0 || res === 1) {
                resolve(res);
            }
            else {
                reject(err)
            }
        })
    });
}

//specific function for adding remote interfaces to redis database
var addRemoteInterface = function (data) {
    var interfaces = [];
    var ids = [];
    for (var i = 0; i < data.length; i++) {
        interfaces.push(data[i]);
        if (data[i].id != 1 && data[i].offer_status === "6") {
            ids.push(data[i].id);
        }
    }
    deleteItem("remoteInterfaces");
    rightPush("remoteInterfaces", ids);
    return interfaces;
}
//specific function for adding footprints to redis database after select query from database
var addFootprintsRedis = function (data) {

    evalItem("return redis.call('del', 'defaultKey', unpack(redis.call('keys', ARGV[1])))", 0, "footprints:*");

    var footprints = [];

    for (var i = 0; i < data.length; i++) {
        footprints.push(data[i]);

        var obj = {
            endpointId: data[i].endpoint_id,
            maskNum: data[i].mask_num,
            prefix: data[i].prefix,
            subnetIp: data[i].subnet_ip,
            subnetNum: data[i].subnet_num
        }

        var stringified = JSON.stringify(obj);
        rightPush("footprints:" + data[i].endpoint_id, stringified);

    }
    return footprints;
}

var listRangeAsync = function (key, start, stop) {
    return new Promise(function (resolve, reject) {
        client.lrange(key, start, stop, function (err, res) {
            if (err === undefined) {
                reject(err);
            }
            if (res.length != 0) {
                resolve(res);
            }
            else {
                reject(err)
            }
        })
    });
}

var listRange = function(key,start,stop){
    client.lrange(key, start, stop, function (err, res) {
        if (err === undefined) {
                reject(err);
            }
            if (res.length != 0) {
                resolve(res);
            }
            else {
                reject(err)
            }
    });
}



module.exports = {
    deleteItem: deleteItem,
    deleteItemAsync: deleteItemAsync,
    evalItem: evalItem,
    rightPush: rightPush,
    rightPushAsync: rightPushAsync,
    set: set,
    existAsync: existAsync,
    addRemoteInterface: addRemoteInterface,
    addFootprintsRedis: addFootprintsRedis,
    listRangeAsync: listRangeAsync
}