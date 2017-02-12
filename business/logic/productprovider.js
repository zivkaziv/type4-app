/**
 * Created by ziv on 06/02/2017.
 */
var ProductScraper = require('../scraper/productscraperlogic');
var Product = require('../../models/Product');

exports.getProduct =  function(barcodeId){
    //check if it's exist in DB. if not scrape it and save it in DB;
    return new Promise((resolve,reject) => {
        Product.findOne({ barcode_id: barcodeId }, function(err, product) {
            if(!product) {
                ProductScraper.scrapeProduct(barcodeId)
                    .then(function (product) {
                        product.number_of_searches = 1;
                        product.save();
                        resolve(product);
                    }, function (unfoundProduct) {
                        unfoundProduct.save();
                        reject(unfoundProduct);
                    });
            }else{
                if(product.number_of_searches){
                    product.number_of_searches +=1;
                }else{
                    product.number_of_searches = 1;
                }
                product.save();
                resolve(product);
            }
        });
    });
};