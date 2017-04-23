angular.module('MyApp')
    .controller('ProductEditorCtrl', function($scope, $location, $window, $auth,ProductsService) {
        $scope.products = [];
        $scope.selected = {};
        $scope.undoSelected = {};
        $scope.isLoading = false;
        $scope.isSaved = false;

        $scope.searchCriteria = {
            searchText: '',
            db:'scrapeproducts'
        };

        $scope.$watch('selected',function(){
            $scope.isSaved = false;
        },true);
        $scope.search = function(){
            if(!$scope.isLoading) {
                $scope.isLoading = true;
                ProductsService.get($scope.searchCriteria).then(function (response) {
                    $scope.isLoading = false;
                    if (response) {
                        $scope.products = response.data;
                    }
                });
            }
        };

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.selectedItem = function(item){
            console.log(item);
            $scope.isSaved = false;
            if(!item.ingredients_raw){
                item.ingredients_raw = item.ingredients ? item.ingredients.join() : [];
            }
            $scope.undoSelected = angular.copy(item);
            $scope.selected = item;
        };

        $scope.undo = function(){
            $scope.selected = $scope.undoSelected;
        };

        $scope.save = function(){
            if($scope.selected.ingredients_raw ){
                $scope.selected.ingredients = $scope.selected.ingredients_raw.split(',').map((item)=>item.trim());
            }
            ProductsService.update($scope.selected).then(function(res){
                if(res.data ==='SAVED'){
                    $scope.isSaved = true;
                    console.log(res);
                }
            });
        };
    });
