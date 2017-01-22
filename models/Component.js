var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var componentSchema = new mongoose.Schema({
  names: [String]
}, schemaOptions);

var Component = mongoose.model('Component', componentSchema);

module.exports = Component;
