angular.module('MyApp')
    .factory('Product', function($http) {
        return {
            get: function(query){
                return $http.get('/product?q='+query, data);
            },
            update: function(product) {
                return $http.post('/product', data);
            }
        };
    });