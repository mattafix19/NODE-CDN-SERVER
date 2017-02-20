var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/Martin';
var db = pgp(connectionString);



function getData(req, res, next) {
  db.any('SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type JOIN offer_status offStat ON cdn.offer_status = offStat.id_offer_status')
    .then(function (result) {
      var interfaces = [];
      for (var i = 0; i < result.length; i++) {
        interfaces.push(result[i]);
      }
      res.status(200)
        .json({
          status: 'success',
          data: interfaces,
          message: 'Retrieved ALL Data'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getFootprints(req, res, next) {
  db.any('SELECT * from footprint')
    .then(function (result) {
      var footprints = [];
      for (var i = 0; i < result.length; i++) {
        footprints.push(result[i]);
      }
      res.status(200)
        .json({
          status: 'success',
          data: footprints,
          message: 'Retrieved ALL Footprints'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function addFootprints(req, res, next) {
  var data = {
    endpoint: req.body.endpoint,
    subnetNum: req.body.subnetNum,
    maskNum: req.body.maskNum,
    subnetIp: req.body.subnetIp,
    prefix: req.body.prefix
  };
  db.any('INSERT INTO footprint (endpoint_id,subnet_num,mask_num,subnet_ip,prefix) VALUES ($1,$2,$3,$4,$5)', [data.endpoint, data.subnetNum, data.maskNum, data.subnetIp, data.prefix])
    .then(function (result) {
      db.any('SELECT * FROM footprint ORDER BY id ASC')
        .then(function (result2) {
          var footprints = [];
          for (var i = 0; i < result2.length; i++) {
            footprints.push(result2[i]);
          }
          res.status(200)
            .json({
              status: 'success',
              data: footprints,
              message: 'Retrieved ALL Footprints'
            });
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getData: getData,
  getFootprints: getFootprints,
  addFootprints: addFootprints
};