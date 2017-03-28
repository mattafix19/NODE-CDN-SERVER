var path = require('path');

var db = require('../services/databaseService');

var defaultRoute = function (req, res, next) {
    var user = req.session.login;
    if (user == undefined) {
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else {
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
    }
}

var afterLogin = function (req, res, next) {
    var user = req.session.login;

    if (user == undefined) {
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }
    else {
        res.sendFile(path.join(__dirname, '../views', 'cdnManagement.html'));
    }
}
//("SELECT * FROM users WHERE login=($1) AND pass=($2) AND admin='t';", [data.login, data.pass]);
var loginUser = function (req, res, next) {
    
    req.session.login = req.body.login;
    var results = [];

    var data = {
        login: req.body.login,
        pass: req.body.pass
    };
    db.db.any("SELECT * FROM users WHERE login=($1) AND pass=($2) AND admin='t';", [data.login, data.pass])
    .then(function(foundUser){
        res.send(foundUser);
    })
    .catch(function(err){
        res.send("");
    });
}

var logout = function (req, res, next) {
    req.session.login = undefined;
    res.send("Success");
}

module.exports = {
    defaultRoute: defaultRoute,
    afterLogin: afterLogin,
    loginUser: loginUser,
    logout: logout,
    loginUser: loginUser
}