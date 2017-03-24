var bluebird = require("bluebird");

var redis = require('redis'),
    client = redis.createClient(6379);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = {
    client:client
};