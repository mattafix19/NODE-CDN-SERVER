var express = require('express');
var session = require('express-session');
var router = express.Router();

router.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

//CONTENT ORIGINS ROUTES

var ciscoCds = require('../services/ciscoCdsService');
//GET CONTENT ORIGINS
router.get('/getContentOrigins', ciscoCds.getContentOriginsRouter);
//CREATE CONTENT ORIGIN
router.post('/createContentOrigins', ciscoCds.createContentOriginRouter);
//UPDATE CONTENT ORIGIN
router.put('/updateContentOrigins/:originID', ciscoCds.updateContentOrigin);
//DELETE CONTENT ORIGIN
router.delete('/deleteContentOrigins/:originID', ciscoCds.deleteContentOrigin); 

//---------------------------------------------------------------------------------------------------------------------------------------------------
//DELIVERY SERVICES ROUTES
//---------------------------------------------------------------------------------------------------------------------------------------------------

//GET DELIVERY SERVICES
router.get('/getDeliveryServices', ciscoCds.getDeliveryServices);

//GET SERVICE ENGINES
router.get('/getSE', ciscoCds.getServiceEnginesRouter);

//CREATE DELIVERY SERVICE
router.post('/createDeliveryService', ciscoCds.createDeliveryServiceRouter);

//DELETE DELIVERY SERVICE
router.delete('/deleteDeliveryService/:ID', ciscoCds.deleteDeliveryService);

//ASSIGN SERVICE ENGINE
router.post('/assignSE', ciscoCds.assignServiceEngineRouter);

//UNASSIGN SERVICE ENGINE
router.post('/unAssignSE', ciscoCds.unassignServiceEngine);

module.exports = router;
