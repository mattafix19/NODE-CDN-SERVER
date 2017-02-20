var app = angular.module('Login', ['ngCookies']);

app.controller('LoginController', ['$cookieStore', '$scope', '$http', '$window', function ($cookieStore, $scope, $http, $window) {

    $scope.formData = {};
    $scope.userData = {};
    $scope.error = false;

    // LOGIN USER
    $scope.loginUser = function (userID) {
        $http.post('/loginUser', $scope.formData).success(function (data) {
            //clear form
            $scope.formData = {};
            $scope.userData = data;

            //if returned data are empty login credentials does not exists 
            if (data == "") {
                $scope.error = true;
            }
            else {
                //open after login html
                $cookieStore.put('user', data);
                window.location = '/afterLogin';
            }
        })
            //catch error
            .error(function (error) {
                console.log('Error: ' + error);
            });
    }

}]);

