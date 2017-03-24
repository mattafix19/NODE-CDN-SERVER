//class which contains working with postgre database
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/Martin';
var db = pgp(connectionString);

module.exports = {
    db:db
};