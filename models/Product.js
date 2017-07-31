var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var productSchema = new mongoose.Schema({
    barcode_id: { type: String, unique: true},
    amazon_id: String,
    name: String,
    category: String,
    image_url: String,
    ingredients_image_url: String,
    scrape_result: String,
    number_of_searches: Number,
    scraped_time: Date,
    ingredients : [String],
    product_url : String,
    scraper_strategy : String,
    reported_date : Date,
    reported_users : [{}]
}, schemaOptions);

var Product = mongoose.model('Product', productSchema);

productSchema.pre('save', (next) => {
    var product = this;
    if(!product.image_url || product.image_url === ''){
        product.image_url = 'http://typeiv.herokuapp.com/images/no_image.png';
    }
    next();
});

module.exports = Product;

