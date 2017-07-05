/**
 * POST /buildallergies
 */

var allergiesBuilder = require('../business/logic/allergiescollectionbuilder');
var Allergy = require('../models/Allergy');

var allergiesCache = [];
exports.buildAllergiesCollectionPost = function(req, res) {
    allergiesBuilder.buildAllergiesCollection();
    res.send('done');
};

/**
 * GET /allergies
 */
exports.getAllAllergiesGet = function(req, res) {
    Allergy.find({}, function(err, allergies) {
        allergiesCache = allergies;
        res.send(allergies);
    });
};

exports.analyzeAllergiesPost = function(req,res){
    console.log(req.body);
    var fullProducts = [];
    var allergiesDetected = [];
    var products = req.body.products;

    handleAllergies().then(()=>{
        products.map((product) =>{
            fullProducts.push(findProduct(product))
        });

        fullProducts.map((product) =>{
            allergiesDetected.push(getAllergyFromProduct(allergiesCache,product))
        });

        res.send(allergiesDetected);
    });

};

function findProduct(product){
    return product;
}

function getAllergyFromProduct(allergies,product){
    var ingredient_analysis =[];
    if(allergies && product){
        for (let ingredientIndex = 0; ingredientIndex < product.ingredients.length; ingredientIndex++) {
            let isSensitiveIngredient = false;
            for (let allergyIndex = 0; allergyIndex < allergies.length; allergyIndex++) {
                if (allergies[allergyIndex].compound.toLowerCase().indexOf(product.ingredients[ingredientIndex].toLowerCase()) > -1) {
                    ingredient_analysis.push({
                        name: product.ingredients[ingredientIndex],
                        analysis: 'SENSITIVE'
                    });
                    isSensitiveIngredient = true
                }
            }
            if(!isSensitiveIngredient){
                ingredient_analysis.push({
                    name: product.ingredients[ingredientIndex],
                    analysis: 'NOT_SENSITIVE'
                })
            }
        }
    }
    return ingredient_analysis;
}

function handleAllergies(){
    return new Promise((resolve,reject) => {
        if (allergiesCache.length === 0) {
            Allergy.find({}, function (err, allergies) {
                allergiesCache = allergies;
                resolve(allergiesCache);
            });
        } else {
            resolve(allergiesCache);
        }
    });
}