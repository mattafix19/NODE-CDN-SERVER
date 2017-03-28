var app = angular.module('Login', ['ngCookies']);

app.controller('LoginController', ['$cookieStore', '$scope', '$http', '$window', '$timeout', function ($cookieStore, $scope, $http, $window, $timeout) {

    $scope.formData = {};
    $scope.userData = {};
    $scope.error = false;

    // LOGIN USER
    $scope.loginUser = function (userID) {
        $http.post('/loginUser', $scope.formData)
            .success(function (data) {
                //clear form
                $scope.formData = {};
                $scope.userData = data;
                console.log("USER" + data);

                //if returned data are empty login credentials does not exists 
                if (data == "") {
                    $scope.error = true;
                    $timeout(function () { $scope.error = false; }, 3000);
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

