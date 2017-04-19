angular.module('MyApp')
    .controller('ProductEditorCtrl', function($scope, $location, $window, $auth,ProductsService) {
        $scope.products = [];
        $scope.selected = {};

        $scope.searchCriteria = {
            searchText: '',
            db:'scrapeproducts'
        };

        $scope.search = function(){
            ProductsService.get($scope.searchCriteria).then(function(response){
                if(response) {
                    $scope.products = response.data;
                }
            });
        };

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.selectedItem = function(item){
            console.log(item);
            $scope.selected = item;
        };

        $scope.search();
    });
