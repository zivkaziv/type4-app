var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var scrapedProductSchema = new mongoose.Schema({
    barcode_id: { type: String, unique: true},
    amazon_id: { type: String, unique: true},
    name: String,
    category: String,
    image_url: String,
    scrape_result: String,
    number_of_searches: Number,
    scraped_time: Date,
    ingredients : [String],
    product_url : String,
    scraper_strategy : String
}, schemaOptions);

var ScrapedProduct = mongoose.model('ScrapedProduct', scrapedProductSchema);

module.exports = ScrapedProduct;

