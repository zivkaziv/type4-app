var ProductProvider = require('../business/logic/productprovider');
var jwt = require('jsonwebtoken');
/**
 * GET product/:pId
 */
exports.productGet = function(req, res) {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }

    ProductProvider.getProduct(req.params.pId)
        .then(function(product){
            if(userId){
                console.log(userId);
                //mark problematic ingredients
            }
            res.send(product);
        },function(err){
            console.error(err);
            res.send(err);
        });
};