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
    .controller('AllergyDiagnoseCtrl', ["$scope", "$location", "$window", "$auth", "ProductsService", "$q", function($scope, $location, $window, $auth,ProductsService,$q) {
        $scope.querySearch  = $scope.search;
        $scope.products = [];
        $scope.selected = {};
        $scope.undoSelected = {};
        $scope.isLoading = false;
        $scope.isSaved = false;

        $scope.searchCriteria = {
            searchText: '',
            db:'scrapeproducts'
        };

        $scope.querySearchOld = function(text){
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
            var deferred = $q.defer();
            // console.log(item);
            if(!item) {
                deferred.resolve('');
            }
            return deferred.promise
        };

        $scope.search = function(text){
            console.log('searching ' + text);
            $scope.searchCriteria.searchText = text;
            return ProductsService.get($scope.searchCriteria);
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
  .factory('Contact', ["$http", function($http) {
    return {
      send: function(data) {
        return $http.post('/contact', data);
      }
    };
  }]);
angular.module('MyApp')
    .factory('ProductsService', ["$http", function($http) {
        return {
            get: function(criteria){
                var dbName = '&db=' +criteria.db ;
                return $http.get('/product?q='+criteria.searchText + dbName);
            },
            update: function(product) {
                return $http.post('/product', product);
            }
        };
    }]);