/**
 * Created by ziv on 09/04/2017.
 */

const cheerioReq = require("cheerio-req");
const request = require('request');
var Product = require('../../../models/Product');
var UnfoundProduct = require('../../../models/Unfoundproduct');
var ScrapedProduct = require('../../../models/Scrapedprodcut');
var crypto = require('crypto');

const UPC_DB_URL = "http://www.upcitemdb.com/upc/";
var AmazonScraper = require('./productscraperamazonus');

exports.scrape = function(barcodeId){
    return new Promise((resolve,reject) => {
        let product = new Product();
        let unfoundProduct = new UnfoundProduct();
        product.barcode_id = barcodeId;
        ScrapedProduct.findOne({barcode_id:product.barcode_id}, function(err, product) {
            if(product) {
                let selectedProduct = products[0];
                product.name = selectedProduct.name;
                product.barcode_id = selectedProduct.barcode_id;
                product.image_url = selectedProduct.image_url;
                product.ingredients = selectedProduct.ingredients;
                product.product_url = selectedProduct.product_url;
                product.scraper_strategy = selectedProduct + selectedProduct.scraper_strategy + '&&&&' + 'upc-item-db';
                product.scraped_time = new Date();
                product.scrape_result = 'FOUND';
                resolve(products);
            }else{
                unfoundProduct.barcode_id = barcodeId;
                unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_SCRAPED_ITEMS_DB';
                unfoundProduct.name = barcodeId;
                reject(unfoundProduct);
            }
        });
    });
};

findAmazonId = function($){
    var details = $('.detail-list').children();
    for(let detailIndex = 0 ; detailIndex < details.length; detailIndex++){
        let detailValue = $(details[detailIndex]).text();
        if(detailValue === 'Amazon ASIN:'){
            return $(details[++detailIndex]).text();
        }
    }
    return undefined;
};