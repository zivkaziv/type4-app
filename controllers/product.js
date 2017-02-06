var ProductProvider = require('../business/logic/productprovider');
/**
 * GET user/:uId/product/:pId
 */
exports.productGet = function(req, res) {
    ProductProvider.getProduct(req.params.pId)
        .then(function(product){
            res.send(product);
        },function(err){
            console.error(err);
            res.send(err);
        });
};