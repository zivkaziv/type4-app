/**
 * Created by ziv on 05/02/2017.
 */
var amazonUsScraper = require('./strategies/productscraperamazonus');
var digitalEysScraper = require('./strategies/digiteyesscrapper');
var upcItemDbScraper = require('./strategies/upcitemdb');

exports.scrapeProduct = function(barcodeId){
    return new Promise((resolve,reject) => {
            upcItemDbScraper.scrape(barcodeId).then(function(product){
            resolve(product);
        },function(err){
            console.log(err);
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
    });
};