/**
 * Created by ziv on 05/02/2017.
 */
var amazonUsScraper = require('./strategies/productscraperamazonus');
var digitalEysScraper = require('./strategies/digiteyesscrapper');
var upcItemDbScraper = require('./strategies/upcitemdb');
var scrapedProductsDBScraper = require('./strategies/scrapedproductsdb');

exports.scrapeProduct = function(barcodeId){
    return new Promise((resolve,reject) => {
        scrapedProductsDBScraper.scrape(barcodeId).then(function (product) {
            resolve(product);
        }, function (err) {
            console.log(err);
            upcItemDbScraper.scrape(barcodeId).then(function (product) {
                resolve(product);
            }, function (err) {
                console.log(err);
                amazonUsScraper.scrape(barcodeId).then(function (product) {
                    resolve(product);
                }, function (err) {
                    console.log(err);
                    digitalEysScraper.scrape(barcodeId).then(function (product) {
                        resolve(product);
                    }, function (err) {
                        reject(err);
                    });
                });
            });
        });
    });
};