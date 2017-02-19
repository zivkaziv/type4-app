var ProductProvider = require('../business/logic/productprovider');
var jwt = require('jsonwebtoken');
var User = require('../models/User');

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
                console.log('the user id is ' + userId);
                User.findById(userId , function(err, user) {
                    if(user){
                        markProblematicIngredients(user,product);
                    }
                    res.send(product);
                });
                //mark problematic ingredients
            }else{
                res.send(product);
            }
        },function(err){
            console.error(err);
            res.send(err);
        });
};

function markProblematicIngredients(user,product){
    if(user && product){
        product.ingredient_analysis = [];
        if(user.allergies.length == 0){
            for(let ingredientIndex = 0; ingredientIndex <  product.ingredients.length; ingredientIndex++){
                product.ingredient_analysis.push({
                    name: product.ingredients[ingredientIndex],
                    analysis: 'UNKNOWN'
                });
            }
        }else {
            for (let ingredientIndex = 0; ingredientIndex < product.ingredients.length; ingredientIndex++) {
                let isSensetive = false;
                for (let allergyIndex = 0; allergyIndex < user.allergies.length; allergyIndex++) {
                    if (user.allergies[allergyIndex].originalObject.compound.toLowerCase().indexOf(product.ingredients[ingredientIndex].toLowerCase()) > -1) {
                        product.ingredient_analysis.push({
                            name: product.ingredients[ingredientIndex],
                            analysis: 'SENSITIVE'
                        });
                        isSensetive = true;
                        break;
                    }
                }
                if(!isSensetive) {
                    product.ingredient_analysis.push({
                        name: product.ingredients[ingredientIndex],
                        analysis: 'NOT_SENSITIVE'
                    })
                }
            }
        }

        product._doc.ingredient_analysis = product.ingredient_analysis;
    }
}