/**
 * Created by ziv on 06/02/2017.
 */
var ProductScraper = require('../scraper/productscraperlogic');
var Product = require('../../models/Product');

exports.getProduct =  function(barcodeId){
    //check if it's exist in DB. if not scrape it and save it in DB;
    return new Promise((resolve,reject) => {
        Product.findOne({ barcode_id: barcodeId }, function(err, product) {
            //if we've found the product and we have the ingredients list
            if(product && product.ingredients.length > 0){
                if(product.number_of_searches){
                    product.number_of_searches +=1;
                }else{
                    product.number_of_searches = 1;
                }
                product.save();
                resolve(product);
            }else{
                ProductScraper.scrapeProduct(barcodeId)
                    .then(function (product) {
                        Product.findOne({barcode_id: barcodeId},(err,productFromDb) => {
                            if(productFromDb){
                                Product.update({_id: productFromDb.id}, {
                                    ingredients: product.ingredients,
                                    number_of_searches: productFromDb.number_of_searches++
                                }, function(err, affected, resp) {
                                    productFromDb.ingredients = product.ingredients;
                                    resolve(productFromDb);
                                })
                            }else{
                                product.number_of_searches = 1;
                                product.save((err) => {
                                    if(err){
                                        console.log(err);
                                    }
                                    resolve(product);
                                });
                            }
                        });

                    }, function (unfoundProduct) {
                        unfoundProduct.save();
                        reject(unfoundProduct);
                    });
            }
        });
    });
};

