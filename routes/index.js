var express = require('express');
var session = require('express-session');
var router = express.Router();
var pg = require('pg');
var path = require('path');

var soap = require('soap');

var www = require('../bin/www');

var Pgb = require("pg-bluebird");
var pgb = new Pgb();

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432';

router.use(session({
    secret: 'secret_key'
}));


var interfaces = [];
var footprints = [];



//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
/* GET home page. */
router.get('/', function (req, res, next) {

    var user = req.session.login;

    if (user == undefined) {
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else {
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
    }
});

router.get('/afterLogin', function (req, res, next) {
    var user = req.session.login;

    if (user == undefined) {
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
});

router.get('/connectCDN', function (req, res) {
    console.log("Neco");
    www.connection();
});

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//MANAGING FOOTPRINTS FOR SPECIFIC CDN Interface APIs
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

router.get('/getFootprints', function (req, res, next) {

    var cnn;

    pgb.connect(connectionString)
        .then(function (connection) {
            cnn = connection;
            return cnn.client.query("SELECT * FROM footprint");
        })
        .then(function (result) {
            console.log(result.rows);

            for (var i = 0; i < result.rows.length; i++) {
                footprints.push(result.rows[i]);
            }
            loadedFootprints = true;
            cnn.done();
            var temp_field = footprints;
            footprints = [];
            return res.json(temp_field);
        })
        .catch(function (error) {
            console.log(error);
        });


    // Get a Postgres client from the connection pool
    /*pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        
        // SQL Query > Select Data
        //var query = client.query("SELECT * FROM cdn_interface ORDER BY id ASC;");
        var query = client.query("SELECT * FROM footprint");
           //SELECT value FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });*/

});

//ADD FOOTPRINT
router.post('/addFootprints', function (req, res) {

    var results = [];

    // Grab data from http request
    var data = {
        endpoint: req.body.endpoint,
        subnetNum: req.body.subnetNum,
        maskNum: req.body.maskNum,
        subnetIp: req.body.subnetIp,
        prefix: req.body.prefix
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO footprint (endpoint_id,subnet_num,mask_num,subnet_ip,prefix) VALUES ($1,$2,$3,$4,$5)", [data.endpoint, data.subnetNum, data.maskNum, data.subnetIp, data.prefix]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM footprint ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//CDN INTERFACE APIs
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET ALL CDN INTERFACES
router.get('/getData', function (req, res, next) {

    var cnn;

    pgb.connect(connectionString)
        .then(function (connection) {
            cnn = connection;
            return cnn.client.query("SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type");
        })
        .then(function (result) {
            console.log(result.rows);

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


    /*
    var results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        //var query = client.query("SELECT * FROM cdn_interface ORDER BY id ASC;");
        var query = client.query("SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type");
           //SELECT value FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });*/
});

//INSERT CDN interface
router.post('/addCDN', function (req, res) {

    var results = [];

    // Grab data from http request
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
        endpoint_type: req.body.endpoint_type
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO cdn_interface (name, url, url_translator, url_cdn, port_cdn, login, pass, priority, endpoint_type_id, endpoint_gateway_type_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", [data.name, data.url, data.url_translator, data.url_cdn, data.port_cdn, data.login, data.pass, data.priority, data.endpoint_gateway_type, data.endpoint_type]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM cdn_interface ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
});

//DELETE CDN INTERFACE
router.delete('/deleteCDNinterface/:cdnId', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.cdnId;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM cdn_interface WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM cdn_interface cdn JOIN endpoint_gateway_type endp ON cdn.endpoint_gateway_type_id = endp.id_gateway JOIN endpoint_type endpt ON cdn.endpoint_type_id = endpt.id_type");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });

});

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//LOGIN LOGOUT APIs
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

//LOGOUT
router.get('/logoutUser', function (req, res, next) {
    req.session.login = undefined;
    res.send("Success");
});


//LOGIN
router.post('/loginUser', function (req, res) {


    req.session.login = req.body.login;

    var results = [];

    var data = {
        login: req.body.login,
        pass: req.body.pass
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users WHERE login=($1) AND pass=($2) AND admin='t';", [data.login, data.pass]);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });

});

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//CONTENT ORIGINS ROUTES
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET CONTENT ORIGINS
router.get('/getContentOrigins', function (req, res) {


    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getContentOrigins&param=all",
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                //console.log(body);
            }
            if (response != null) {
                var parseString = require('xml2js').parseString;
                parseString(response.body, function (err, result) {
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];
                        console.log(obj.$.Fqdn);
                    }
                    console.log(response);
                    return res.json(result);
                });
            }
        }
    );
});

//CREATE CONTENT ORIGIN
router.post('/createContentOrigin', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createContentOrigin&name=" + req.body.origName + "&origin=" + req.body.origServer + "&fqdn=" + req.body.origFqdnName,
        console.log(url);
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                //console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );
});

//UPDATE CONTENT ORIGIN
router.post('/updateContentOrigin/:originID', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.originID;

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=modifyContentOrigin&contentOrigin=" + id + "&name=" + req.body.name + "&origin=" + req.body.originFqdn + "&fqdn=" + req.body.rfqdn,
        console.log(url);
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );

});

//DELETE CONTENT ORIGIN
router.delete('/deleteContentOrigin/:originID', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.originID;

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=deleteContentOrigins&contentOrigin=" + id,
        console.log(url);
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                console.log(body);
            }
            if (response != null) {
                return res.json(response);
            }
        }
    );

});


//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//DELIVERY SERVICES ROUTES
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET DELIVERY SERVICES
router.get('/getDeliveryServices', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getDeliveryServices&param=all",
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                //console.log(body);
            }
            if (response != null) {
                var parseString = require('xml2js').parseString;
                parseString(response.body, function (err, result) {
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];
                        console.log(obj.$.Fqdn);
                    }
                    console.log(response);
                    return res.json(result);
                });
            }
        }
    );
});

//GET SE SERVICES
router.get('/getSE', function (req, res) {

    var request = require('request');
    var request = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false
    });

    username = "admin",
        password = "CdnLab_123",
        url = "https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getSEs&param=all",
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            if (error != null || body != null) {
                //console.log(body);
            }
            if (response != null) {
                var parseString = require('xml2js').parseString;
                parseString(response.body, function (err, result) {
                    for (var i = 0, len = result.listing.record.length; i < len; i++) {
                        var obj = result.listing.record[i];
                        console.log(obj.$.Fqdn);
                    }
                    console.log(response);
                    return res.json(result);
                });
            }
        }
    );
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//isert user
router.post('/api/v1/users', function (req, res) {

    var results = [];

    // Grab data from http request
    var data = {
        login: req.body.login,
        pass: req.body.pass,
        admin: false
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO users (login, pass, admin) values($1, $2, $3)", [data.login, data.pass, data.admin]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });


    });
});

//update user
router.put('/api/v1/users/:users_id', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.users_id;

    // Grab data from http request
    var data = {
        login: req.body.login,
        pass: req.body.pass,
        admin: false
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({ success: false, data: err }));
        }

        // SQL Query > Update Data
        client.query("UPDATE users SET login=($1), pass=($2), admin=($3) WHERE id=($4)", [data.login, data.pass, data.admin, id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });

});

//delete user
router.delete('/api/v1/users/:users_id', function (req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.users_id;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM users WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });

});

module.exports = router;