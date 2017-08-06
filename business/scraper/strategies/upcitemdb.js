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
        let url = UPC_DB_URL + barcodeId;
        console.log(url);
        cheerioReq(url, (err, $) => {
            let productName = $('.detailtitle b').text();
            if(false){
                unfoundProduct.barcode_id = product.barcode_id;
                unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_UPC_ITEM_DB';
                reject(unfoundProduct);
            }else{
                let amazonId = findAmazonId($);
                //in case we found the amazonID - continue in Amazon
                if(amazonId){
                    productName.amazon_id = amazonId;
                    AmazonScraper.extractFromAmazon(product, barcodeId, resolve, unfoundProduct, reject);
                }else{//try to find by names
                    let names = $('ol li');
                    let optionalNames = [];
                    for(let nameIndex = 0; nameIndex < names.length; nameIndex++){
                        let name = $(names[nameIndex]).text().trim();
                        optionalNames.push(name);
                    }
                    ScrapedProduct.find({$or:[{barcode_id:product.barcode_id},{ name: {$in : optionalNames }}]}, function(err, products) {
                        if(products && products.length > 0) {
                            let selectedProduct = products[0];
                            product.name = selectedProduct.name;
                            product.barcode_id = selectedProduct.barcode_id;
                            product.image_url = selectedProduct.image_url;
                            product.ingredients = selectedProduct.ingredients;
                            product.product_url = selectedProduct.product_url;
                            product.scraper_strategy = selectedProduct + scraper_strategy + '&&&&' + 'upc-item-db';
                            product.scraped_time = new Date();
                            product.scrape_result = 'FOUND';
                            resolve(products);
                        }else{
                            unfoundProduct.barcode_id = product.barcode_id;
                            unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_SCRAPED_ITEMS_DB';
                            unfoundProduct.error = optionalNames.toString();
                            unfoundProduct.name = productName;
                            reject(unfoundProduct);
                        }
                    });

                }
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