var app = angular.module('cdnManagement', ['ngCookies']);

app.controller('TabController', ['$cookieStore', '$scope', '$http', '$window', function ($cookieStore, $scope, $http, $window) {

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

    var deliveryServicesReceived = 0;
    var serviceEnginesReceived = 0;

    var loggedUser = $cookieStore.get('user');

    $scope.user = loggedUser[0].login;

    this.tab = 2;
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
        $http.post('/createContentOrigin', $scope.formCreateContent)
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
        $http.post('/updateContentOrigin/' + tableData.id, tableData)
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
        $http.delete('/deleteContentOrigin/' + originID)
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

    $http.get('/getContentOrigins')
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

    //GET ALL CONTENT ORIGINS

    $scope.addSeName = function () {
        var arrDeliveryServices = [];
        for (var i = 0, length = $scope.deliveryServicesData.length; i < length; i++) {
            for (var j = 0, length = $scope.serviceEnginesData.length; j < length; j++) {
                if ($scope.deliveryServicesData[i].seID === $scope.serviceEnginesData[j].id) {
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
                }
            }
        }
        $scope.deliveryServicesAll = arrDeliveryServices;
        serviceEnginesReceived = 0;
        deliveryServicesReceived = 0;
    };

    $http.get('/getDeliveryServices')
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
            deliveryServicesReceived = 1;
            if (serviceEnginesReceived == 1) {
                $scope.addSeName();
            }
            arrContentOrigins = [];
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    //GET SERVICE ENGINES
    $http.get('/getSE')
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

            serviceEnginesReceived = 1;
            var arrDeliveryServices = [];
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
        console.log($scope.formCreateDelSer);
        
        $http.post('/createContentOrigin', $scope.formCreateContent)
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