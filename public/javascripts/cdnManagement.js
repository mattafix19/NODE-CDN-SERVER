var app = angular.module('cdnManagement', ['ngCookies']);

app.controller('TabController', ['$cookieStore', '$scope', '$http', '$window', function($cookieStore, $scope, $http, $window) {

    $scope.formData = {};
    $scope.cdnData = {};

    var loggedUser = $cookieStore.get('user');

    $scope.user = loggedUser[0].login;


    this.tab = 1;

    this.isSet = function(checkTab) {
        return this.tab === checkTab;
    };

    this.setTab = function(setTab) {
        this.tab = setTab;
    };

    // CREATE NEW CDN
    $scope.addCDN = function() {
        $http.post('/addCDN', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };
    //GET ALL CDN
    $http.get('/getCDNinterface')
        .success(function(data) {
            $scope.cdnData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });

    $scope.logout = function() {
        $http.get('/logoutUser')
            .success(function(data) {
                console.log(data);
                window.location = '/'
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    }
    /*       
    //DELETE CDN
    $scope.deleteUser = function(userID) {
        $http.delete('/api/v1/users/' + userID)
            .success(function(data) {
                $scope.userData = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
    
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