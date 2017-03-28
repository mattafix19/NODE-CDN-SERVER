var express = require('express');
var session = require('express-session');
var router = express.Router();

//specific body parser for translationservice
var xmlparser = require('express-xml-bodyparser');

//import database Service
var db = require('../services/databaseService.js');

//import translation service
var translationService = require('../services/translationService');
var loginService = require('../services/loginService');

router.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

/* GET home page. */
router.get('/', loginService.defaultRoute);
//after login
router.get('/afterLogin', loginService.afterLogin);

//LOGIN
router.post('/loginUser', loginService.loginUser);

//LOGOUT
router.get('/logoutUser', loginService.logout);


//CDNI routes for default load resources
router.get('/getData', db.getData);
router.get('/getFootprints', db.getFootprints);
router.post('/addFootprints', db.addFootprints);
router.post('/addCdn', db.addCdn);
router.delete('/deleteCDNinterface/:cdnId', db.deleteCDNinterface);
router.delete('/deleteFootprints/:footId', db.deleteFootprints);

//Translation Service
router.post('/CDNTranslationService', xmlparser({ trim: false, explicitArray: false }), translationService.translationService);

module.exports = router;