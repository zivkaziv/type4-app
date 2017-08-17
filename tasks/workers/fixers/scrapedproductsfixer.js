const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');
var random = require('mongoose-random');

exports.CommonFixer = class CommonFixer {
    constructor() {
    }

    fixProductsInScrapedProductsDB(){
        return setInterval(function() {
                // ScrapedProduct.findOne({'product_url' : {$regex : ".*657622412782*"}}).skip(0).exec(function (err, productToScrape) {
                ScrapedProduct.findOne({ barcode_id: { $exists: true }},function(err,productToFix) {
                    try {
                        if (productToFix && productToFix.barcode_id && productToFix.barcode_id.length < 13) {
                            productToFix.barcode_id = fixBarcode(productToFix);
                            ScrapedProduct.update({_id: productToFix.id}, {
                                barcode_id: productToFix.barcode_id
                            }, function(err, affected, resp) {
                                console.log('SAVED ' + productToFix.barcode_id);
                            })
                        } else {
                            console.log('no products');
                        }
                    }catch (err){
                        console.log('Error ' + err);
                    }
                });
        }, 2000);
    }
};

fixBarcode = function(product){
    let newBarcode = '';
    if(product.barcode_id) {
        newBarcode = product.barcode_id;
        while (newBarcode.length < 13){
            newBarcode = '0'+newBarcode;
        }
    }
    return newBarcode;
};