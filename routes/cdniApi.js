var express = require('express');
var session = require('express-session');
var router = express.Router();

var db = require('../services/databaseService.js');
var interconnectionService = require('../services/interconnectionService');

router.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//initial offer from FRONTEND
router.post('/initialOffer',interconnectionService.initialOffer);

//initial accept offer from FRONTEND
router.post('/initialAcceptOffer', interconnectionService.initialAcceptOffer);

//create offer SERVER communication
router.post('/createOffer', db.registerOffer);

//accept offer SERVER communication
router.post('/acceptOffer', db.acceptOffer);

//create list for send, get own interface, own content origins, footprints
router.post('/createLists', interconnectionService.createLists);

//set received lists
router.post('/setLists', interconnectionService.setLists);

//initial delete interconnection from FRONTEND
router.delete('/initialDeleteInterconnection/:targetID', interconnectionService.initialDeleteInterconnection);

//delete Interconnection SERVER communication
router.delete('/deleteInterconnection/:interfaceId', interconnectionService.deleteInterconnection);

//delete interconnection accept
router.delete('/deleteInterconnectionAccept/:interfaceId', interconnectionService.deleteInterconnectionAccept);

module.exports = router;