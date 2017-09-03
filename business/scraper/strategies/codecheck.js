/**
 * Created by ziv on 05/02/2017.
 */

const cheerioReq = require("cheerio-req");
const cheerio = require('cheerio');
const request = require('request');
var Product = require('../../../models/Product');
var UnfoundProduct = require('../../../models/Unfoundproduct');

const CODECHECK_URL =  "https://www.codecheck.info/product.search?q={upc}&OK=Suchen";

exports.scrape = function(barcodeId){
    return new Promise((resolve,reject) => {
        let product = new Product();
        let unfoundProduct = new UnfoundProduct();
        product.barcode_id = barcodeId;
        let url = CODECHECK_URL.replace('{upc}',barcodeId);
        console.log(url);
        cheerioReq(url, (err, $) => {
            try {
                product.name = $('.float-group h1').text().trim();
                product.image_url = $('.cc-image img').attr('src') ? 'https://www.codecheck.info/img' + $('.cc-image img').attr('src').trim() : 'http://typeiv.herokuapp.com/images/no_image.png';
                product.scrape_result = 'FOUND';
                product.scraper_strategy = 'codecheck.info';
                product.scraped_time = new Date();
                product.ingredients = $('#product-ingredients').text().trim().replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);
                if (product.name !== '') {
                    if(product.ingredients.length == 0){
                        unfoundProduct.barcode_id = product.barcode_id;
                        unfoundProduct.name = product.name;
                        unfoundProduct.scrape_result = 'NO_INGREDIENTS';
                        reject(unfoundProduct);
                    }else{
                        resolve(product);
                    }
                } else {
                    unfoundProduct.barcode_id = product.barcode_id;
                    unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_CODECHECK';
                    reject(unfoundProduct);
                }
            } catch (err) {
                unfoundProduct.barcode_id = product.barcode_id;
                unfoundProduct.scrape_result = 'NOT_FOUND_ERROR';
                unfoundProduct.error = err;
                reject(unfoundProduct);
            }
        });
    });
};

exports.ingredientsScrape = function(barcodeId){
    return new Promise((resolve,reject) => {
        let product = new Product();
        let unfoundProduct = new UnfoundProduct();
        product.barcode_id = barcodeId;
        let url = CODECHECK_URL.replace('{upc}',barcodeId);
        console.log(url);
        cheerioReq(url, (err, $) => {
            try {
                product.name = $('.float-group h1').text().trim();
                product.image_url = $('.cc-image img').attr('src') ? 'https://www.codecheck.info/img' + $('.cc-image img').attr('src').trim() : 'http://typeiv.herokuapp.com/images/no_image.png';
                product.scrape_result = 'FOUND';
                product.scraper_strategy = 'codecheck.info';
                product.scraped_time = new Date();
                product.ingredients = $('#product-ingredients').text().trim().replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);
                if (product.name !== '') {
                    if(product.ingredients.length == 0){
                        unfoundProduct.barcode_id = product.barcode_id;
                        unfoundProduct.name = product.name;
                        unfoundProduct.scrape_result = 'NO_INGREDIENTS';
                        reject(unfoundProduct);
                    }else{
                        resolve(product);
                    }
                } else {
                    unfoundProduct.barcode_id = product.barcode_id;
                    unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_CODECHECK';
                    reject(unfoundProduct);
                }
            } catch (err) {
                unfoundProduct.barcode_id = product.barcode_id;
                unfoundProduct.scrape_result = 'NOT_FOUND_ERROR';
                unfoundProduct.error = err;
                reject(unfoundProduct);
            }
        });
    });
};