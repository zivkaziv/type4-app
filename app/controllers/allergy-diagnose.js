angular.module('MyApp')
    .controller('AllergyDiagnoseCtrl',
        function($scope, $location, $window, $auth,ProductsService,$q,$log) {
        $scope.querySearch  = $scope.search;
        $scope.selected = {};
        $scope.selectedItem = {};
        $scope.selectedProducts = [];
        $scope.isLoading = false;
        $scope.isSaved = false;

        $scope.searchCriteria = {
            searchText: ' ',
            db:'scrapeproducts'
        };

        $scope.selectedItemChange= function(item) {
            $scope.selectedItem = item;
        };

        $scope.querySearchOld = function(text){
            console.log('ziv ' + text);
            if(!$scope.isLoading) {
                $scope.isLoading = true;
                ProductsService.get(text).then(function (response) {
                    $scope.isLoading = false;
                    if (response) {
                        $scope.products = response.data;
                    }
                });
            }
        };

        $scope.getProductDetails = function(item){
            console.log(item);

            if(item.name){
                return item.name;
            }
            return ' ';
            // var deferred = $q.defer();
            // // console.log(item);
            // if(!item) {
            //     deferred.resolve('');
            // }
            // return deferred.promise
        };

        $scope.search = function(text){
            if(text === ''){
                return [];
            }
            console.log('searching ' + text);
            $scope.searchCriteria.searchText = text;
            return ProductsService.getQuery($scope.searchCriteria);
        };

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };


        $scope.select = function(){
            $scope.addSelectedProduct($scope.selectedItem);
            $scope.selectedItem = {};
        };

        $scope.addSelectedProduct = function(productToAdd){
            var shouldAdd = true;
            $scope.selectedProducts.forEach(function(product){
                if(product._id === productToAdd._id){
                    shouldAdd = false;
                }
            });
            if(shouldAdd){
                $scope.selectedProducts.push(productToAdd);
            }
        }
    });