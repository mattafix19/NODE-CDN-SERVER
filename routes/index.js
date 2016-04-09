var express = require('express');
var session = require('express-session');
var router = express.Router();
var pg = require('pg');
var path = require('path');

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432';

router.use(session({
  secret: 'secret_key'
}));

/* GET home page. */
router.get('/', function(req, res, next) {

    var user = req.session.login;
    
    if (user == undefined){
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else{
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));    
    }
});

router.get('/afterLogin', function(req, res, next) {
    var user = req.session.login;
    
    if (user == undefined){
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
});

router.get('/getCDNinterface', function(req, res) {

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
        var query = client.query("SELECT * FROM cdn_interface ORDER BY id ASC;");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

//insert CDN interface
router.post('/addCDN', function(req, res) {

    var results = [];

    // Grab data from http request
    var data = {
        ip: req.body.ip, 
        port: req.body.port,
        login: req.body.login,
        pass: req.body.pass
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO cdn_interface (ipaddress, port, login, password) values($1, $2, $3, $4)", [data.ip, data.port, data.login, data.pass]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM cdn_interface ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });
});

router.get('/logoutUser', function(req, res, next) {
    req.session.login = undefined;
    res.send("Success");
});
    

//login
router.post('/loginUser', function(req, res) {
    
     
    req.session.login = req.body.login;

    var results = [];
    
    var data = {
        login: req.body.login, 
        pass: req.body.pass
    }; 
   
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users WHERE login=($1) AND pass=($2) AND admin='t';", [data.login, data.pass]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

//get all users
router.get('/api/v1/users', function(req, res) {

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
        var query = client.query("SELECT * FROM users ORDER BY id ASC;");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

//isert user
router.post('/api/v1/users', function(req, res) {

    var results = [];

    // Grab data from http request
    var data = {
        login: req.body.login, 
        pass: req.body.pass,
        admin: false
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO users (login, pass, admin) values($1, $2, $3)", [data.login, data.pass, data.admin]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });


    });
});

//update user
router.put('/api/v1/users/:users_id', function(req, res) {

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
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).send(json({ success: false, data: err}));
        }

        // SQL Query > Update Data
        client.query("UPDATE users SET login=($1), pass=($2), admin=($3) WHERE id=($4)", [data.login, data.pass, data.admin,id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

//delete user
router.delete('/api/v1/users/:users_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.users_id;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM users WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

module.exports = router;
