
var allergiesBuilder = require('../business/logic/allergiescollectionbuilder');
var Allergy = require('../models/Allergy');
/**
 * POST /buildallergies
 */
exports.buildAllergiesCollectionPost = function(req, res) {
    allergiesBuilder.buildAllergiesCollection();
    res.send('done');
};

/**
 * GET /allergies
 */
exports.getAllAllergiesGet = function(req, res) {
    Allergy.find({}, function(err, allergies) {
        res.send(allergies);
    });
};

