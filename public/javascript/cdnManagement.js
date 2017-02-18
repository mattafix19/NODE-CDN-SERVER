var app = angular.module('cdnManagement', ['ngCookies']);

app.controller('TabController', ['$location','$cookieStore', '$scope', '$http', '$window', function ($location,$cookieStore, $scope, $http, $window) {
    console.log($location);
    $scope.formData = {};
    $scope.cdnData = {};

    $scope.formFootprintsData = {};
    $scope.footprintData = {};

    $scope.contentOriginsData = {};
    $scope.serviceEnginesData = {};
    $scope.deliveryServicesData = {};
    $scope.deliveryServicesAll = {};


    $scope.formCreateContent = {};
    $scope.formCreateDelSer = {};
    $scope.formAssignDelSer = {};

    var deliveryServicesReceived = 0;
    var serviceEnginesReceived = 0;

    var loggedUser = $cookieStore.get('user');

    $scope.user = loggedUser[0].login;

    this.tab = 1;
    this.isSet = function (checkTab) {
        return this.tab === checkTab;
    };
    this.setTab = function (setTab) {
        this.tab = setTab;
    };

    var callbackCounter = 0;

    $scope.logout = function () {
        $http.get('/logoutUser')
            .success(function (data) {
                console.log(data);
                window.location = '/'
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    }

    $scope.createOffer = function(){
        $http.get('http://localhost:8080/cdniApi/createOfferAdmin')
            .success(function (data) {
                console.log(data);
                //window.location = '/'
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //CDN INTERFACE FUNCTIONS
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------

    $scope.addCDN = function () {
        $http.post('/addCDN', $scope.formData)
            .success(function (data) {
                $scope.formData = {};
                $scope.cdnData = data;
                console.log(data);
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };

    function connectCDN() {
        $http.get('/connectCDN')
            .success(function (data) {
                //$scope.cdnData = data;
                console.log(data);
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    }

    //GET ALL CDN
    $http.get('/getData')
        .success(function (data) {
            $scope.cdnData = data;
            callbackCounter++;
            if (callbackCounter == 2) {
                connectCDN();
                callbackCounter = 0;
            }
            /*
            $scope.formData.name = data[0].name;
            $scope.formData.url = data[0].url;
            $scope.formData.url_translator = data[0].url_translator;
            $scope.formData.url_cdn = data[0].url_cdn;
            $scope.formData.port_cdn = data[0].port_cdn;
            $scope.formData.login = data[0].login;
            $scope.formData.priority = data[0].priority;
            $scope.formData.endpoint_gateway_type = data[0].endpoint_gateway_type;
            $scope.formData.endpoint_type = data[0].endpoint_type;*/

            console.log(data);
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    //DELETE CDN
    $scope.deleteCDNinterface = function (cdnID) {
        $http.delete('/deleteCDNinterface/' + cdnID)
            .success(function (data) {
                $scope.cdnData = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //FOOTPRINT FUNCTIONS
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------

    //GET ALL FOOTPRINTS

    $http.get('/getFootprints')
        .success(function (data) {
            $scope.footprintData = data;
            callbackCounter++;
            if (callbackCounter == 2) {
                connectCDN();
                callbackCounter = 0;
            }
            console.log(data);
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    //CREATE NEW FOOTPRINT
    $scope.addFootprint = function () {
        $http.post('/addFootprints', $scope.formFootprintsData)
            .success(function (data) {
                $scope.formFootprintsData = {};
                $scope.footprintData = data;
                console.log(data);
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };


    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //CONTENT ORIGINS EDITATION
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------


    //CREATE CONTENT ORIGIN
    $scope.createContentOrigin = function () {
        waitingDialog.show();
        $http.post('/cdsmApi/createContentOrigin', $scope.formCreateContent)
            .success(function (data) {
                $scope.formData = {};
                $scope.cdnData = data;
                $window.location.reload();
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };

    $scope.editingData = {};

    for (var i = 0, length = $scope.contentOriginsData.length; i < length; i++) {
        $scope.editingData[$scope.contentOriginsData[i].id] = false;
    }

    $scope.modify = function (tableData) {
        $scope.editingData[tableData.id] = true;
    };

    //UPDATE CONTENT ORIGIN
    $scope.updateContentOrigin = function (tableData) {
        $scope.editingData[tableData.id] = false;
        waitingDialog.show();
        $http.post('/cdsmApi/updateContentOrigin/' + tableData.id, tableData)
            .success(function (data) {
                $scope.formData = {};
                $scope.cdnData = data;
                $window.location.reload();
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };

    $scope.cancel = function (tableData) {
        $scope.editingData[tableData.id] = false
    }

    //DELETE CONTENT ORIGIN
    $scope.deleteContentOrigin = function (originID) {
        waitingDialog.show();
        $http.delete('/cdsmApi/deleteContentOrigin/' + originID)
            .success(function (data) {
                $scope.formData = {};
                $scope.cdnData = data;
                $window.location.reload();
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };

    //GET ALL CONTENT ORIGINS

    $http.get('/cdsmApi/getContentOrigins')
        .success(function (data) {
            var arrContentOrigins = [];

            for (var i = 0, len = data.listing.record.length; i < len; i++) {
                var obj = data.listing.record[i];

                var contentOrigin = {
                    name: obj.$.Name,
                    originFqdn: obj.$.OriginFqdn,
                    rfqdn: obj.$.Fqdn,
                    id: obj.$.Id
                }
                arrContentOrigins.push(contentOrigin)

            }

            $scope.contentOriginsData = arrContentOrigins;
            arrContentOrigins = [];
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //DELIVERY SERVICES EDITATION
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------


    // call function to merge 2 requests , get delivery services and get service engines
    // loop through responses and find service engines for delivery services
    $scope.addSeName = function () {
        var arrDeliveryServices = [];
        for (var i = 0, length = $scope.deliveryServicesData.length; i < length; i++) {
            var foundSe = 0;
            for (var j = 0, length2 = $scope.serviceEnginesData.length; j < length2; j++) {

                console.log(j + 1);
                console.log($scope.serviceEnginesData.length);
                if ($scope.deliveryServicesData[i].seID === $scope.serviceEnginesData[j].id) {
                    foundSe = 1;
                    var deliveryService = {
                        name: $scope.deliveryServicesData[i].name,
                        originFqdn: $scope.deliveryServicesData[i].originFqdn,
                        rfqdn: $scope.deliveryServicesData[i].rfqdn,
                        id: $scope.deliveryServicesData[i].id,
                        originID: $scope.deliveryServicesData[i].originID,
                        seID: $scope.deliveryServicesData[i].seID,
                        seName: $scope.serviceEnginesData[j].name
                    }
                    console.log(deliveryService);
                    arrDeliveryServices.push(deliveryService);
                    break;
                }

                if ((j + 1 === $scope.serviceEnginesData.length)) {

                    var deliveryService = {
                        name: $scope.deliveryServicesData[i].name,
                        originFqdn: $scope.deliveryServicesData[i].originFqdn,
                        rfqdn: $scope.deliveryServicesData[i].rfqdn,
                        id: $scope.deliveryServicesData[i].id,
                        originID: $scope.deliveryServicesData[i].originID,
                        seID: null,
                        seName: "Unassigned"
                    }
                    console.log(deliveryService);
                    arrDeliveryServices.push(deliveryService);
                }
            }
        }
        $scope.deliveryServicesAll = arrDeliveryServices;
        serviceEnginesReceived = 0;
        deliveryServicesReceived = 0;
    };

    // GET ALL DELIVERY SERVICES
    $http.get('/cdsmApi/getDeliveryServices')
        .success(function (data) {
            var arrContentOrigins = [];

            for (var i = 0, len = data.listing.record.length; i < len; i++) {
                var obj = data.listing.record[i];


                var contentOrigin = {
                    name: obj.$.Name,
                    originFqdn: obj.$.OriginFqdn,
                    rfqdn: obj.$.Fqdn,
                    id: obj.$.Id,
                    originID: obj.$.ContentOriginId,
                    seID: obj.$.ContentAcquirer
                }
                arrContentOrigins.push(contentOrigin)

            }
            $scope.deliveryServicesData = arrContentOrigins;
            var arrDeliveryServices = [];
            //this is check if response come first from get Service engines or get delivery services
            deliveryServicesReceived = 1;
            //if service engines was received then call addSeName FUNCTIONS
            if (serviceEnginesReceived == 1) {
                $scope.addSeName();
            }
            arrContentOrigins = [];
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    //GET SERVICE ENGINES
    $http.get('/cdsmApi/getSE')
        .success(function (data) {
            var arrContentOrigins = [];

            for (var i = 0, len = data.listing.record.length; i < len; i++) {
                var obj = data.listing.record[i];
                var contentOrigin = {
                    name: obj.$.Name,
                    id: obj.$.Id
                }
                arrContentOrigins.push(contentOrigin)

            }
            $scope.serviceEnginesData = arrContentOrigins;
            //this is check if response come first from get Service engines or get delivery services
            serviceEnginesReceived = 1;
            var arrDeliveryServices = [];
            //if delivery services was received then call function
            if (deliveryServicesReceived == 1) {
                $scope.addSeName();
            }
            arrContentOrigins = [];
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    //CREATE DELIVERY SERVICE
    $scope.createDeliveryService = function () {
        waitingDialog.show();
        var origName = $scope.formCreateDelSer.contentOrigin;
        var originID = 0;
        // loop through contentOriginsData because in front end is showed only name, so we must find ID for name
        for (var i = 0, len = $scope.contentOriginsData.length; i < len; i++) {
            if ($scope.contentOriginsData[i].name === origName) {
                originID = $scope.contentOriginsData[i].id;
                break;
            }
        }

        var tempObj = {
            serName: $scope.formCreateDelSer.serName,
            idOrigin: originID
        }

        console.log(tempObj)
        $http.post('/cdsmApi/createDeliveryService', tempObj)
            .success(function (data) {
                $scope.formData = {};
                $scope.cdnData = data;
                $window.location.reload();
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };

    //DELETE DELIVERY SERVICE
    $scope.deleteDeliveryService = function (ID) {
        waitingDialog.show();
        $http.delete('/cdsmApi/deleteDeliveryService/' + ID)
            .success(function (data) {
                $scope.formData = {};
                $scope.cdnData = data;
                $window.location.reload();
            })
            .error(function (error) {
                console.log('Error: ' + error);
            });
    };

    //ASSIGN/UNASSIGN SERVICE ENGINE
    $scope.assignSE = function (delSer, swtch) {
        waitingDialog.show();
        // because in table there are 2 sources of data, from deliveryServicesAll and in dropdown serviceEnginesData, delivery service is passed through function and seName through scope
        var seName = $scope.formAssignDelSer.seName;
        var delSerID;
        var seID;
        //find IDs according to name 
        for (var i = 0, len = $scope.deliveryServicesAll.length; i < len; i++) {
            if ($scope.deliveryServicesAll[i].name === delSer) {
                delSerID = $scope.deliveryServicesAll[i].id;
                break;
            }
        }

        for (var i = 0, len = $scope.serviceEnginesData.length; i < len; i++) {
            if ($scope.serviceEnginesData[i].name === seName) {
                seID = $scope.serviceEnginesData[i].id;
                break;
            }
        }

        var tempObj = {
            delSerID: delSerID,
            seID: seID
        }

        console.log(delSerID + "   " + seID);
        if (swtch === 1) {
            $http.post('/cdsmApi/assignSE', tempObj)
                .success(function (data) {
                    $scope.formData = {};
                    $scope.cdnData = data;
                    $window.location.reload();
                })
                .error(function (error) {
                    console.log('Error: ' + error);
                });
        }
        else{
            $http.post('/cdsmApi/unAssignSE', tempObj)
                .success(function (data) {
                    $scope.formData = {};
                    $scope.cdnData = data;
                    $window.location.reload();
                })
                .error(function (error) {
                    console.log('Error: ' + error);
                });
        }

    };


    $scope.editingDataDelivery = {};

    for (var i = 0, length = $scope.deliveryServicesAll.length; i < length; i++) {
        $scope.editingDataDelivery[$scope.deliveryServicesAll[i].id] = false;
    }

    $scope.modifyDelivery = function (tableData) {
        $scope.editingDataDelivery[tableData.id] = true;
    };

    $scope.cancelDelivery = function (tableData) {
        $scope.editingDataDelivery[tableData.id] = false
    }


    /*
    $http.get('/api/v1/users')
        .success(function(data) {
            $scope.userData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    // CREATE NEW USER
    $scope.createUser = function() {
        $http.post('/api/v1/users', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.userData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };
 
    //DELETE USER
    $scope.deleteUser = function() {
        $http.delete('/api/v1/users/' + userID)
            .success(function(data) {
                $scope.userData = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };*/
}]);