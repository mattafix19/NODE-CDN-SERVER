var bluebird = require("bluebird");

var redis = require('redis'),
    client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


module.exports = client;