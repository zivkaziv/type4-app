var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var productSchema = new mongoose.Schema({
  name: String,
  barcodeId: { type: String, unique: true},
  components : [String]
}, schemaOptions);

var Product = mongoose.model('Products', productSchema);

module.exports = Product;
