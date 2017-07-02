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

var userProductReactionSchema = new mongoose.Schema({
    user: {},
    product: {},
    location: {},
    analysis:[]
}, schemaOptions);

var UserProductReaction = mongoose.model('UserProductReaction', userProductReactionSchema);

module.exports = UserProductReaction;

