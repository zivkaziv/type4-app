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

var userProductSearchSchema = new mongoose.Schema({
    user: {},
    product: {},
    location: {},
    analysis:[]
}, schemaOptions);

var UserProductSearch = mongoose.model('UserProductSearch', userProductSearchSchema);

module.exports = UserProductSearch;

