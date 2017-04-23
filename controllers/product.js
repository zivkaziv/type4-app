var ProductProvider = require('../business/logic/productprovider');
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var Product = require('../models/Product');
var ScrapedProduct = require('../models/Scrapedprodcut');

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
                        saveUserSearch(user,product);
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

/**
 * GET product?q=xzcfszx&db=product/scrape
 */
exports.productByQueryGet = function(req, res) {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }
    let parameter  =req.query.q;
    if(userId) {
        let DbName = ScrapedProduct;
        if(req.query.db && req.query.db.indexOf('scrape') === -1){
            DbName = Product;
        }
        if(parameter) {
            DbName.find({
                $or: [
                    {barcode_id: {$regex: new RegExp(".*" + parameter + "*", "i")}},
                    {name: {$regex: new RegExp(".*" + parameter + "*", "i")}}
                ]
            }, function (err, products) {
                if (err) {
                    res.send(err);
                }
                res.send(products);
            });
        }else{
            res.send([]);
        }
    }else{
        res.send('TOKEN');
    }
};

exports.productPost = function(req, res) {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }

    if(userId) {
        let dbName = Product;
        if(req.body.scraper_strategy){
            dbName = ScrapedProduct;
        }
        let productToSave = req.body;
        dbName.findById(req.body.id, (err, product) => {
            product.ingredients = productToSave.ingredients;
            product.name = productToSave.name;
            product.image_url = productToSave.image_url;
            product.barcode_id = productToSave.barcode_id;
            product.amazon_id = productToSave.amazon_id;
            product.category = productToSave.category;
            product.product_url = productToSave.product_url;
            product.save(function (err) {
                if (err) {
                    res.error(err);
                } else {
                    res.send('SAVED');
                }
            });
        });
    }else{
        res.send('TOKEN');
    }
};

function markProblematicIngredients(user,product){
    if(user && product){
        product.ingredient_analysis = [];
        product.is_safe = true;
        if(user.allergies.length == 0){
            for(let ingredientIndex = 0; ingredientIndex <  product.ingredients.length; ingredientIndex++){
                product.ingredient_analysis.push({
                    name: product.ingredients[ingredientIndex],
                    analysis: 'UNKNOWN'
                });
                product.is_safe = false;
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
                        product.is_safe = false;
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
        product._doc.analysis_result = product.is_safe? 'SAFE' : 'NOT_SAFE';
    }
}

function saveUserSearch(user,product){
    user.searches.push(product);
    user.save();
}