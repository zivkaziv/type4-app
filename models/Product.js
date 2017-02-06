var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var productSchema = new mongoose.Schema({
    barcode_id: { type: String, unique: true},
    amazon_id: { type: String, unique: true},
    name: String,
    category: String,
    image_url: String,
    scrape_result: String,
    scraped_time: Date,
    ingredients : [String]
}, schemaOptions);

var Product = mongoose.model('Product', productSchema);

module.exports = Product;

