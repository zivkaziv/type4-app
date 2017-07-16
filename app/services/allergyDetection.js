angular.module('MyApp')
    .factory('AllergyDetectionService', function($http,$q) {
        return {
            analyze: function(products){
                return $http.post('/analyzeallergies',{'products':products});
            }
        };
    });