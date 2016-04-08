angular.module('cdnInterface', [])

    .controller('mainController', function($scope, $http ) {

        $scope.formData = {};
        $scope.cdnData = {};

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
        };*/
    });