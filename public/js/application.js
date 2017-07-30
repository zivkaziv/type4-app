angular.module('MyApp', ['ngRoute', 'satellizer','ngMaterial'])
  .config(["$routeProvider", "$locationProvider", "$authProvider", function($routeProvider, $locationProvider, $authProvider) {
    skipIfAuthenticated.$inject = ["$location", "$auth"];
    loginRequired.$inject = ["$location", "$auth"];
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html'
      })
      .when('/contact', {
        templateUrl: 'partials/contact.html',
        controller: 'ContactCtrl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/account', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'ForgotCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/reset/:token', {
        templateUrl: 'partials/reset.html',
        controller: 'ResetCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/product-editor', {
          templateUrl: 'partials/product-editor.html',
          controller: 'ProductEditorCtrl',
      })
        .when('/add-product-editor', {
            templateUrl: 'partials/add-product.html',
            controller: 'AddProductEditorCtrl',
        })
      .when('/diagnose', {
            templateUrl: 'partials/allergy-diagnose.html',
            controller: 'AllergyDiagnoseCtrl',
      })
      .otherwise({
        templateUrl: 'partials/404.html'
      });

    $authProvider.loginUrl = '/login';
    $authProvider.signupUrl = '/signup';

    function skipIfAuthenticated($location, $auth) {
      if ($auth.isAuthenticated()) {
        $location.path('/');
      }
    }

    function loginRequired($location, $auth) {
      if (!$auth.isAuthenticated()) {
        $location.path('/login');
      }
    }
  }])
  .run(["$rootScope", "$window", function($rootScope, $window) {
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
  }]);

angular.module('MyApp')
    .controller('AddProductEditorCtrl', ["$scope", "$location", "$window", "$auth", "ProductsService", function($scope, $location, $window, $auth,ProductsService) {
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
            var indexToSave = 0;
            if($scope.index > 0 && $scope.products[$scope.index]){
                $scope.undoSelected = $scope.products[$scope.index--];
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

        $scope.mark = function(){
            $scope.products[$scope.index].status = 'MARK';
            ProductsService.saveProductToAdd($scope.products[$scope.index]).then(()=>{
                $scope.next();
            });
        };
        $scope.loadNewProduct = function(){
            ProductsService.getProductToAdd($scope.productStatus).then(function(product){
                if($scope.addNewProduct(product.data)){
                    $scope.index++;
                    $scope.undoSelected = $scope.products[$scope.index];
                }
                console.log($scope.products[$scope.index]);
            });
        };

        $scope.next = function(){
            console.log('next');
            if($scope.index+1 < $scope.products.length){
                $scope.loadNewProduct();
            }else{
                $scope.undoSelected = $scope.products[$scope.index];
            }
        };

        $scope.prev = function(){
            console.log('prev');
            $scope.index = $scope.index>0?$scope.index--:0;
            $scope.undoSelected = $scope.products[$scope.index];
        };

        $scope.init();

        $scope.addNewProduct = function(product){
            var isAdded = true;
            for(var i= i; i < $scope.products.length; i++){
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
    }]);

angular.module('MyApp')
    .controller('AllergyDiagnoseCtrl',
        ["$scope", "$location", "$window", "$auth", "ProductsService", "$q", "$log", "AllergyDetectionService", function($scope, $location, $window, $auth,ProductsService,$q,$log,AllergyDetectionService) {
        $scope.querySearch  = $scope.search;
        $scope.selected = {};
        $scope.selectedItem = {};
        $scope.selectedProducts = [];
        $scope.allergiesDetected = [];
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
            if(text === '' || text.length < 2){
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
            $scope.searchCriteria.searchText = ' ';
            $scope.analyze();
        };

        $scope.clear = function(){
            $scope.selectedProducts.length = 0;
            $scope.allergiesDetected.length = 0;
            $scope.selectedItem = {};
            $scope.searchCriteria.searchText = ' ';
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
        };

        $scope.analyze = function(){
            AllergyDetectionService.analyze($scope.selectedProducts).then((allergies)=>{
                $scope.allergiesDetected = allergies.data === ''?[]:allergies.data;
                console.log($scope.allergiesDetected);
            });
        };
    }]);

angular.module('MyApp')
  .controller('ContactCtrl', ["$scope", "Contact", function($scope, Contact) {
    $scope.sendContactForm = function() {
      Contact.send($scope.contact)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };
  }]);

angular.module('MyApp')
  .controller('ForgotCtrl', ["$scope", "Account", function($scope, Account) {
    $scope.forgotPassword = function() {
      Account.forgotPassword($scope.user)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };
  }]);

angular.module('MyApp')
  .controller('HeaderCtrl', ["$scope", "$location", "$window", "$auth", function($scope, $location, $window, $auth) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
    
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    
    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/');
    };
  }]);

angular.module('MyApp')
  .controller('LoginCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", function($scope, $rootScope, $location, $window, $auth) {
    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/account');
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/');
        })
        .catch(function(response) {
          if (response.error) {
            $scope.messages = {
              error: [{ msg: response.error }]
            };
          } else if (response.data) {
            $scope.messages = {
              error: [response.data]
            };
          }
        });
    };
  }]);
angular.module('MyApp')
    .controller('ProductEditorCtrl', ["$scope", "$location", "$window", "$auth", "ProductsService", function($scope, $location, $window, $auth,ProductsService) {
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
    }]);

angular.module('MyApp')
  .controller('ProfileCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", "Account", function($scope, $rootScope, $location, $window, $auth, Account) {
    $scope.profile = $rootScope.currentUser;

    $scope.updateProfile = function() {
      Account.updateProfile($scope.profile)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };

    $scope.changePassword = function() {
      Account.changePassword($scope.profile)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };

    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $window.scrollTo(0, 0);
          $scope.messages = {
            error: [response.data]
          };
        });
    };
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: [response.data]
          };
        });
    };

    $scope.deleteAccount = function() {
      Account.deleteAccount()
        .then(function() {
          $auth.logout();
          delete $window.localStorage.user;
          $location.path('/');
        })
        .catch(function(response) {
          $scope.messages = {
            error: [response.data]
          };
        });
    };
  }]);
angular.module('MyApp')
  .controller('ResetCtrl', ["$scope", "Account", function($scope, Account) {
    $scope.resetPassword = function() {
      Account.resetPassword($scope.user)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
  }]);

angular.module('MyApp')
  .controller('SignupCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", function($scope, $rootScope, $location, $window, $auth) {
    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/');
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/');
        })
        .catch(function(response) {
          if (response.error) {
            $scope.messages = {
              error: [{ msg: response.error }]
            };
          } else if (response.data) {
            $scope.messages = {
              error: [response.data]
            };
          }
        });
    };
  }]);
angular.module('MyApp')
  .factory('Account', ["$http", function($http) {
    return {
      updateProfile: function(data) {
        return $http.put('/account', data);
      },
      changePassword: function(data) {
        return $http.put('/account', data);
      },
      deleteAccount: function() {
        return $http.delete('/account');
      },
      forgotPassword: function(data) {
        return $http.post('/forgot', data);
      },
      resetPassword: function(data) {
        return $http.post('/reset', data);
      }
    };
  }]);
angular.module('MyApp')
    .factory('AllergyDetectionService', ["$http", "$q", function($http,$q) {
        return {
            analyze: function(products){
                return $http.post('/analyzeallergies',{'products':products});
            }
        };
    }]);
angular.module('MyApp')
  .factory('Contact', ["$http", function($http) {
    return {
      send: function(data) {
        return $http.post('/contact', data);
      }
    };
  }]);
angular.module('MyApp')
    .factory('ProductsService', ["$http", "$q", function($http,$q) {
        return {
            get: function(criteria){
                var dbName = '&db=' +criteria.db ;
                return $http.get('/product?q='+criteria.searchText + dbName);
            },
            getQuery: function(criteria){
                var deferred = $q.defer();
                var dbName = '&db=' +criteria.db ;
                $http.get('/product?q='+criteria.searchText + dbName).then(function(response){
                    deferred.resolve(response.data);
                });
                return deferred.promise;
            },
            update: function(product) {
                return $http.post('/product', product);
            },
            getProductToAdd: function(status) {
                return $http.get('/producttoadd?status=' + status);
            },
            saveProductToAdd: function(product) {
                return $http.post('save/product', product);
            }
        };
    }]);