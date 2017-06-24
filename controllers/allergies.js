
var allergiesBuilder = require('../business/logic/allergiescollectionbuilder');
var Allergy = require('../models/Allergy');
/**
 * POST /buildallergies
 */

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
    var products = req.body.products;
    if(allergiesCache.length === 0){
        Allergy.find({}, function(err, allergies) {
            allergiesCache = allergies;
        });
    }
    // { _id : { $in : [1,2,3,4] } }
    res.send([]);
};
