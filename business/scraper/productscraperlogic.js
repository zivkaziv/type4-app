/**
 * Created by ziv on 05/02/2017.
 */
var amazonUsScraper = require('./strategies/productscraperamazonus');
var digitalEysScraper = require('./strategies/digiteyesscrapper');

exports.scrapeProduct = function(barcodeId){
    return new Promise((resolve,reject) => {
        amazonUsScraper.scrape(barcodeId).then(function(product){
            resolve(product);
        },function(err){
            console.log(err);
            digitalEysScraper.scrape(barcodeId).then(function(product){
                resolve(product);
            },function(err){
                reject(err);
            });
        });
    });
};