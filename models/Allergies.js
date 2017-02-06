/**
 * Created by ziv on 05/02/2017.
 */
var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var AllergiesSchema = new mongoose.Schema({
    names: [String]
}, schemaOptions);

var Allergies = mongoose.model('Allergy', AllergiesSchema);

module.exports = Allergies;
