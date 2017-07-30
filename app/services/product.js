angular.module('MyApp')
    .factory('ProductsService', function($http,$q) {
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
    });