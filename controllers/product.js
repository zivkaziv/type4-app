var ProductProvider = require('../business/logic/productprovider');
var jwt = require('jsonwebtoken');
var natural = require('natural');

var User = require('../models/User');
var Product = require('../models/Product');
var ScrapedProduct = require('../models/Scrapedprodcut');
var ManualProduct = require('../models/ManualProduct');
var UserProductSearch= require('../models/UserProductSearch');
var UserProductReaction= require('../models/UserProductReaction');

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
 * POST product/:pId
 */
exports.productByIdPost = function(req, res) {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }
    console.log(req.body);
    ProductProvider.getProduct(req.params.pId)
        .then(function(product){
            if(userId){
                console.log('the user id is ' + userId);
                User.findById(userId , function(err, user) {
                    if(user){
                        markProblematicIngredients(user,product);
                        saveUserSearch(user,product,req.body.position);
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
            var q = DbName.find({
                $or: [
                    {barcode_id: {$regex: new RegExp(".*" + parameter + "*", "i")}},
                    {name: {$regex: new RegExp(".*" + parameter + "*", "i")}}
                ]
            }).sort({'date': -1}).limit(20);
            q.exec(function(err, products) {
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
        let dbName = ScrapedProduct;
        if(req.body.scraper_strategy === 'digit-eye' ||
            req.body.scraper_strategy === 'amazon-us' ||
            req.body.barcode_id){
            dbName = Product;
        }
        let productToSave = req.body;
        dbName.findById(req.body.id, (err, product) => {
            if(product) {
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
            }else{
                res.send('NO_PRODUCT');
            }
        });
    }else{
        res.send('TOKEN');
    }
};

exports.reportProblematicProductPost = function(req, res) {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }

    if(userId) {
        let productToReport =req.body.product;
        let user =req.body.user;

        console.log(productToReport._id);
        Product.findById(productToReport._id, (err, product) => {
            if(product) {
                product.reported_date = new Date();
                if(!product.reported_users){
                    product.reported_users = [];
                }
                try {
                    updateUserSearches(user, product);
                }catch (err){
                    console.log(err);
                }
                product.reported_users.push({'email':user.email});
                product.save(function (err) {
                    if (err) {
                        res.error(err);
                    } else {
                        res.send('SAVED');
                    }
                });
            }else{
                res.send('NO_PRODUCT');
            }
        });
    }else{
        res.send('TOKEN');
    }
};

exports.reportReactionProductPost = function(req, res) {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }

    if(userId) {
        let product =req.body.product;
        let user =req.body.user;

        console.log(product._id);
        Product.findById(product._id, (err, product) => {
            if(product) {
                saveUserProductReaction(user,product,req.body.position);
                res.send('SAVED');
            }else{
                res.send('NO_PRODUCT');
            }
        });
    }else{
        res.send('TOKEN');
    }
};

exports.addProductManually = function(req, res){
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }

    if(userId) {
        let manualProductToSave = req.body;
        let manualProduct = new ManualProduct();
        manualProduct.user = manualProductToSave.user;
        manualProduct.product_image_url = manualProductToSave.product_image_url;
        manualProduct.ingredients_image_url = manualProductToSave.ingredients_image_url;
        if(manualProductToSave.product && manualProductToSave.product.barcode_id){
            manualProduct.barcode_id = manualProductToSave.product.barcode_id;
        }else {
            manualProduct.barcode_id = manualProductToSave.barcode_id;
        }
        manualProduct.location = manualProductToSave.location;
        manualProduct.product = manualProductToSave.product;
        manualProduct.status = "FOR_REVIEW";
        manualProduct.save(function (err) {
            if (err) {
                res.error(err);
            } else {
                res.send('SAVED');
            }
        });
    }else{
        res.send('TOKEN');
    }
};

exports.productToAddGet = function(req, res){
    ManualProduct.findOne({'status':req.query.status},(err,product) => {
        if(err) res.error(err);
        res.send(product);
    });
};

exports.saveProductManually = function(req, res){
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    var userId = undefined;
    if(tokenParams){
        userId = tokenParams.sub;
    }

    if(userId) {
        let manualProductToSave = req.body;
        if(manualProductToSave.status.indexOf('MARK') > -1){
            ManualProduct.findById(manualProductToSave._id,(err,manualProduct)=>{
                if(manualProduct) {
                    manualProduct.user = manualProductToSave.user;
                    manualProduct.product_image_url = manualProductToSave.product_image_url;
                    manualProduct.ingredients_image_url = manualProductToSave.ingredients_image_url;
                    manualProduct.barcode_id = manualProductToSave.barcode_id;
                    manualProduct.location = manualProductToSave.location;
                    manualProduct.product = manualProductToSave.product;
                    manualProduct.status = manualProductToSave.status;
                    manualProduct.save(function (err) {
                        if (err) {
                            res.error(err);
                        } else {
                            res.send('SAVED');
                        }
                    });
                }else{
                    res.send('NO_PRODUCT_IN_DB');
                }
            });

        }else{

            Product.findOne({barcode_id:manualProductToSave.product.barcode_id},(err,productToSave)=>{
                if(!productToSave){
                    productToSave = new Product();
                }
                productToSave.ingredients = manualProductToSave.product.ingredients;
                productToSave.name = manualProductToSave.product.name;
                productToSave.image_url = manualProductToSave.product.image_url;
                productToSave.barcode_id = manualProductToSave.product.barcode_id;
                productToSave.amazon_id = manualProductToSave.product.amazon_id;
                productToSave.category = manualProductToSave.product.category;
                productToSave.product_url = manualProductToSave.product.product_url;
                var validMessage = validateNewProduct(productToSave);
                if( validMessage.indexOf('OK')> -1) {
                    productToSave.save((err) => {
                        if (err) {
                            res.send(err.message);
                        } else {
                            res.send('SAVED');
                        }
                        ManualProduct.findById(manualProductToSave._id, (err, manualProduct) => {
                            if (manualProduct) {
                                manualProduct.user = manualProductToSave.user;
                                manualProduct.product_image_url = manualProductToSave.product_image_url;
                                manualProduct.ingredients_image_url = manualProductToSave.ingredients_image_url;
                                manualProduct.barcode_id = manualProductToSave.barcode_id;
                                manualProduct.location = manualProductToSave.location;
                                manualProduct.product = productToSave;
                                manualProduct.status = 'SAVED';
                                manualProduct.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('SAVED');
                                    }
                                });
                            } else {
                                console.log('NO_PRODUCT_IN_DB');
                            }
                        });
                    });
                }else{
                    res.send(validMessage);
                }
            });

        }
    }else{
        res.send('TOKEN');
    }
};

//
//
// exports.updateProductToAdd = function(req, res){
//     let productToUpdate = req.product;
//     ManualProduct.findById(productToUpdate._id,(err,product) => {
//         if(err) res.error(err);
//         product.status
//     });
// };

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
                product.is_safe = true;
            }
            product._doc.analysis_result = 'UNKNOWN';
        }else {
            for (let ingredientIndex = 0; ingredientIndex < product.ingredients.length; ingredientIndex++) {
                let isSensetive = false;
                for (let allergyIndex = 0; allergyIndex < user.allergies.length; allergyIndex++) {
                    if (isCompoundMatch(user.allergies[allergyIndex].originalObject.compound,product.ingredients[ingredientIndex])) {
                        product.ingredient_analysis.push({
                            name: product.ingredients[ingredientIndex],
                            analysis: 'SENSITIVE'
                        });
                        isSensetive = true;
                        product.is_safe = false;
                        break;
                    }
                    //in case this allergy have other synonyms
                    if(user.allergies[allergyIndex].originalObject.compound_synonyms && user.allergies[allergyIndex].originalObject.compound_synonyms.length > 0){
                        for(let synonymIndex = 0; synonymIndex < user.allergies[allergyIndex].originalObject.compound_synonyms.length; synonymIndex++){
                            if (isCompoundMatch(user.allergies[allergyIndex].originalObject.compound_synonyms[synonymIndex],product.ingredients[ingredientIndex])) {
                                product.ingredient_analysis.push({
                                    name: product.ingredients[ingredientIndex],
                                    analysis: 'SENSITIVE'
                                });
                                isSensetive = true;
                                product.is_safe = false;
                                break;
                            }
                        }
                    }
                }
                if(!isSensetive) {
                    product.ingredient_analysis.push({
                        name: product.ingredients[ingredientIndex],
                        analysis: 'NOT_SENSITIVE'
                    })
                }
            }
            product._doc.analysis_result = product.is_safe? 'SAFE' : 'NOT_SAFE';
        }

        product._doc.ingredient_analysis = product.ingredient_analysis;
    }
}

function isCompoundMatch(compound,ingredient){
    //original match.. simple one
    // return compound.toLowerCase().indexOf(ingredient.toLowerCase()) > -1;
    var matchResult = natural.JaroWinklerDistance(compound,ingredient);
    console.log('match result of '+ compound + ' and ' + ingredient + ' is ' + matchResult);
    return matchResult > 0.95;
}

function saveUserSearch(user,product,location){
    user.searches.push(product);
    try {
        user.searches = user.searches.filter((thing, index, self) => self.findIndex(t => t.barcode_id === thing.barcode_id) === index);
    }catch (err){
        console.log(err)
    }

    user.save();

    try {
        let userProductSearch = new UserProductSearch();
        userProductSearch.user = user;
        userProductSearch.product = product;
        userProductSearch.location = location;
        userProductSearch.analysis = product.ingredient_analysis;
        userProductSearch.save();
    }catch (err){
        console.log(err);
    }
}

function updateUserSearches(user,product){
    User.findOne({email:user.email}, (err, user) => {
        if(user) {
            for (let searchIndex = 0; searchIndex <user.searches.size; searchIndex++){
                if(user.searches[searchIndex].barcode_id === product.barcode_id){
                    user.searches[searchIndex].reported_users.push({email:user.email});
                }
            }
            user.save();
        }else{
            console.log('No User');
        }
    })
}

function saveUserProductReaction(user,product,location){
    try {
        let userProductReaction = new UserProductReaction();
        userProductReaction.user = user;
        userProductReaction.product = product;
        if(location) {
            userProductReaction.location = location;
        }
        userProductReaction.analysis = product.ingredient_analysis;
        userProductReaction.save();
        console.log('user reactions - saved');
        User.findById(user._id , function(err, user) {
            console.log('user - saved');
            if(!user.reactions){
                user.reactions = [];
            }
            user.reactions.push(product);
            user.save();
        });
    }catch (err){
        console.log(err);
    }
}

function validateNewProduct(product){
    if(!product.name){
        return 'NO_NAME';
    }
    if(!product.ingredients){
        return 'NO_INGREDIENTS';
    }
    if(!product.barcode_id){
        return 'NO_BARCODE';
    }

    return 'OK'
}