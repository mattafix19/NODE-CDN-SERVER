var app = angular.module('cdnManagement', ['ngCookies']);

app.controller('TabController', ['$cookieStore', '$scope', '$http', '$window', function ($cookieStore, $scope, $http, $window) {

    $scope.formData = {};
    $scope.cdnData = {};

    $scope.formFootprintsData = {};
    $scope.footprintData = {};
    $scope.contentOriginsData = {};
    $scope.contentOriginsDataBackup = {};

    $scope.formCreateContent = {};



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
    //DELIVERY SERVICES EDITATION
    //---------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------




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
                console.log(obj.$.Name);
                console.log(obj.$.Fqdn);
                console.log(obj.$.OriginFqdn);
                console.log(obj.$.Id);

                var contentOrigin = {
                    name: obj.$.Name,
                    originFqdn: obj.$.OriginFqdn,
                    rfqdn: obj.$.Fqdn,
                    id: obj.$.Id
                }
                arrContentOrigins.push(contentOrigin)

            }
            $scope.contentOriginsDataBackup = arrContentOrigins;
            $scope.contentOriginsData = arrContentOrigins;
            arrContentOrigins = [];
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

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