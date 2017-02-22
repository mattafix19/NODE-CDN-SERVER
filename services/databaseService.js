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
              message: 'Retrieved ALL footprints after success footprints insertion'
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

function addCdn(req, res, next) {
  var data = {
    name: req.body.name,
    url: req.body.url,
    url_translator: req.body.url_translator,
    url_cdn: req.body.url_cdn,
    port_cdn: req.body.port_cdn,
    login: req.body.login,
    pass: req.body.pass,
    priority: req.body.priority,
    endpoint_gateway_type: req.body.endpoint_gateway_type,
    endpoint_type: req.body.endpoint_type,
    offer_status: req.body.offerStatus
  };
  db.any('INSERT INTO cdn_interface (name, url, url_translator, url_cdn, port_cdn, login, pass, priority, endpoint_type_id, endpoint_gateway_type_id, offer_status) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [data.name, data.url, data.url_translator, data.url_cdn, data.port_cdn, data.login, data.pass, data.priority, data.endpoint_gateway_type, data.endpoint_type, data.offer_status])
    .then(function (result) {
      db.any('SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type JOIN offer_status offStat ON cdn.offer_status = offStat.id_offer_status')
        .then(function (result2) {
          var interfaces = [];
          for (var i = 0; i < result2.length; i++) {
            interfaces.push(result2[i]);
          }
          res.status(200)
            .json({
              status: 'success',
              data: interfaces,
              message: 'Retrieved ALL cdn interfaces after success interface insertion'
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

function deleteCDNinterface(req, res, next) {
  var id = req.params.cdnId;

  db.any('DELETE FROM cdn_interface WHERE id=($1)', [id])
    .then(function (result) {
      db.any('SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type JOIN offer_status offStat ON cdn.offer_status = offStat.id_offer_status')
        .then(function (result2) {
          var interfaces = [];
          for (var i = 0; i < result2.length; i++) {
            interfaces.push(result2[i]);
          }
          res.status(200)
            .json({
              status: 'success',
              data: interfaces,
              message: 'Retrieved ALL cdn interfaces after success interface deletion'
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

function loginUser(req, res, next) {

  req.session.login = req.body.login;

  var results = [];

  var data = {
    login: req.body.login,
    pass: req.body.pass
  };

  db.any('SELECT * FROM users WHERE login=($1) AND pass=($2) AND admin="t"', [data.login, data.pass])
    .then(function (result) {
      var users = [];
      for (var i = 0; i < result.length; i++) {
        users.push(result[i]);
      }
      res.status(200)
        .json({
          status: 'success',
          data: users,
          message: 'Retrieved ALL Footprints'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function checkInterface(req, res, next) {
  db.any('SELECT * from cdn_interface WHERE url=($1)', [req.body.sender.url])
    .then(function (result) {
      if (result != 0) {
        var id = result[0].id;
        db.any('UPDATE public.cdn_interface SET offer_status=($1) WHERE id=($2)', [id, 2])
          .then(function (result2) {
            res.status(200)
              .json({
                status: 'success',
                data: 'OK',
                message: 'Successfull receive of offer'
              });
          })
          .catch(function (err) {
            return next(err);
          });
      }
      else {
        var data = req.body.sender;
        db.any('INSERT INTO cdn_interface (name, url, url_translator, url_cdn, port_cdn, login, pass, priority, endpoint_type_id, endpoint_gateway_type_id, offer_status) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [data.name, data.url, data.url_translator, data.url_cdn, data.port_cdn, data.login, data.pass, data.priority, 1, 2, 2])
          .then(function (result2) {
            res.status(200)
              .json({
                status: 'success',
                data: 'OK',
                message: 'Successfull receive of offer'
              });
          })
          .catch(function (err) {
            return next(err);
          });
      }
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateTarget(req, res, next) {
  var id = req.id;
  db.any('UPDATE public.cdn_interface SET offer_status=($1) WHERE id=($2)', [2,id])
    .then(function (result) {
      db.any('SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type JOIN offer_status offStat ON cdn.offer_status = offStat.id_offer_status')
        .then(function (result2) {
          var interfaces = [];
          for (var i = 0; i < result2.length; i++) {
            interfaces.push(result2[i]);
          }
          res.status(200)
            .json({
              status: 'success',
              data: interfaces,
              message: 'Successfull receive of offer'
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
  addFootprints: addFootprints,
  addCdn: addCdn,
  deleteCDNinterface: deleteCDNinterface,
  checkInterface: checkInterface,
  updateTarget: updateTarget
};