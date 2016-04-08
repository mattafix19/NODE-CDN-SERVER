angular.module('nodeServer', [])

    .controller('mainController', function($scope, $http ,$window) {

        $scope.formData = {};
        $scope.userData = {};

        // LOGIN USER
        $scope.loginUser = function(userID) {
            $http.post('/api/v1/login', $scope.formData).success(function(data) {
                    $scope.formData = {};
                    $scope.userData = data;
                    //console.log(data); 
                    if (data == ""){
                        console.log("ERROR");
                        $scope.error = 'Incorrect login credentials !';
                    }
                    else{
                        console.log(data);
                        console.log(data.login);
                        window.location = '/afterLogin';
                    }
                })
                .error(function(error) {
                    console.log('Error: ' + error);
                });
        }
        
        $http.get('/api/v1/users')
            .success(function(data) {
                $scope.userData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
        // CREATE NEW USER
        $scope.createUser = function(userID) {
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
    });