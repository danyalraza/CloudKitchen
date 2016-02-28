angular.module('myApp', []).controller('MainCtrl', function ($scope, $http, getDataService) {
    $scope.findValue = function(enteredValue) {
        alert("Searching for = " + enteredValue);

        $scope.MyData = [];
        getDataService.getData(function(data) {
            $scope.MyData = data.SerialNumbers;
        });
    }2
});

angular.module('myApp', []).factory('getDataService', function($http) {
    return {
        getData: function(done) {
            $http.get('/route-to-data.json')
            .success(function(data) {
                done(data);
            })
            .error(function(error) {
                alert('An error occured');
            });
        }
    }
});
