angular.module('MyApp')
    .controller('AddProductEditorCtrl', function($scope, $location, $window, $auth,ProductsService) {
        $scope.products = [];
        $scope.index = -1;
        $scope.selected = {};
        $scope.undoSelected = {};
        $scope.isLoading = false;
        $scope.isSaved = false;
        $scope.error ='';
        $scope.productStatus ='FOR_REVIEW';

        $scope.searchCriteria = {
            searchText: '',
            db:'scrapeproducts'
        };


        $scope.init = function(){
            $scope.loadNewProduct();

        };

        $scope.$watch('index',function(){
            $scope.isSaved = false;
            if($scope.index > 0 && $scope.products[$scope.index]){
                $scope.undoSelected = $scope.products[$scope.index-1];
            }
            $scope.error ='';
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
            $scope.products[$scope.index] = $scope.undoSelected;
        };

        $scope.save = function(){
            if($scope.products[$scope.index].product.ingredients_raw ){
                $scope.products[$scope.index].product.ingredients = $scope.products[$scope.index].product.ingredients_raw.split(',').map((item)=>item.trim());
            }
            ProductsService.saveProductToAdd($scope.products[$scope.index]).then(function(res){
                if(res.data ==='SAVED'){
                    $scope.next();
                }else{
                    $scope.error = res.data;
                }
            });
        };

        $scope.mark = function(status){
            $scope.products[$scope.index].status = status;
            ProductsService.saveProductToAdd($scope.products[$scope.index]).then(()=>{
                $scope.next();
            });
        };

        $scope.loadNewProduct = function(){
            ProductsService.getProductToAdd($scope.productStatus).then(function(product){
                if($scope.addNewProduct(product.data)){
                    $scope.index++;
                    $scope.undoSelected = $scope.products[$scope.index];
                }else{
                    // $scope.index++;
                }
                console.log($scope.products[$scope.index]);
            });
        };

        $scope.next = function(){
            console.log('next');
            if($scope.index + 1 >= $scope.products.length){
                $scope.loadNewProduct();
            }else{
                $scope.index++;
                $scope.undoSelected = $scope.products[$scope.index];
            }
        };

        $scope.prev = function(){
            console.log('prev');
            $scope.index = $scope.index>0?$scope.index - 1: 0 ;
            $scope.undoSelected = $scope.products[$scope.index];
        };

        $scope.init();

        $scope.addNewProduct = function(product){
            var isAdded = true;
            for(var i= 0; i < $scope.products.length; i++){
                if($scope.products[i]._id === product._id){
                    isAdded = false;
                    break;
                }
            }
            if(isAdded){
                $scope.prepareNewProduct(product);
                $scope.products.push(product);
            }
            return isAdded;
        };

        $scope.prepareNewProduct = function(productToPrepare){
            if(productToPrepare) {
                if (!productToPrepare.product) {
                    productToPrepare.product = {};
                }
                productToPrepare.product.barcode_id = productToPrepare.barcode_id;
                productToPrepare.product.image_url = productToPrepare.product_image_url;
            }
        };
    });
