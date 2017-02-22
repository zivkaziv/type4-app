/**
 * Created by ziv on 12/02/2017.
 */
var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var unfoundProductSchema = new mongoose.Schema({
    barcode_id: { type: String, unique: true},
    name: String,
    category: String,
    image_url: String,
    scrape_result: String,
    scraped_time: Date,
    error: String,
    ingredients : [String]
}, schemaOptions);

var UnfoundProduct = mongoose.model('UnfoundProduct', unfoundProductSchema);

module.exports = UnfoundProduct;

