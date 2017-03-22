var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var scrapedProductSchema = new mongoose.Schema({
    barcode_id: { type: String},
    amazon_id: { type: String},
    name: {type:String, index:true},
    category: String,
    image_url: String,
    scrape_result: String,
    number_of_searches: Number,
    scraped_time: Date,
    ingredients : {type:[String], index:true},
    product_url : {type:String, unique:true},
    scraper_strategy : String
}, schemaOptions);

var ScrapedProduct = mongoose.model('ScrapedProduct', scrapedProductSchema);

module.exports = ScrapedProduct;

