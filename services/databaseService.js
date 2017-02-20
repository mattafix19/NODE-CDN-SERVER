var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/Martin';
var db = pgp(connectionString);

/*router.get('/getData', function (req, res, next) {

  var cnn;

  pgb.connect(connectionString)
    .then(function (connection) {
      cnn = connection;
      return cnn.client.query("SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type JOIN offer_status offStat ON cdn.offer_status = offStat.id_offer_status");
    })
    .then(function (result) {
      //console.log(result.rows);

      for (var i = 0; i < result.rows.length; i++) {
        interfaces.push(result.rows[i]);
      }

      var temp_field = [];
      temp_field = interfaces;
      interfaces = [];
      cnn.done();
      return res.json(temp_field);

    })
    .catch(function (error) {
      console.log(error);
    });
});*/

function getData(req, res, next) {
  db.any('SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type JOIN offer_status offStat ON cdn.offer_status = offStat.id_offer_status')
    .then(function (result) {

      for (var i = 0; i < result.rows.length; i++) {
        interfaces.push(result.rows[i]);
      }

      var temp_field = [];
      temp_field = interfaces;
      interfaces = [];
      return res.json(temp_field);
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL Data'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getData: getData
};