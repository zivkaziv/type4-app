angular.module('MyApp')
    .factory('ProductsService', function($http) {
        return {
            get: function(criteria){
                var dbName = '&db=' +criteria.db ;
                return $http.get('/product?q='+criteria.searchText + dbName);
            },
            update: function(product) {
                return $http.post('/product', data);
            }
        };
    });