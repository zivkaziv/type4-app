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
    compound: String,
    db_name: String,
    db_updated_date: Date,
    concentration: Number,
    measure: String,
    art_number:String,
    compound_synonyms:[String]
}, schemaOptions);

var Allergy = mongoose.model('Allergies', AllergiesSchema);

module.exports = Allergy;
