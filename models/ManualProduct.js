/**
 * Created by ziv on 07/05/2017.
 */
var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var manualProductSchema = new mongoose.Schema({
    user: {},
    product: {},
    product_image_url:String,
    ingredients_image_url:String,
    barcode_id:String,
    product_url:String,
    status:String,
    location: {}
}, schemaOptions);

var ManualProduct = mongoose.model('ManualProduct', manualProductSchema);

module.exports = ManualProduct;

