
const cheerioReq = require("cheerio-req");
const request = require('request');
var Product = require('../../../models/Product');
var UnfoundProduct = require('../../../models/Unfoundproduct');
var crypto = require('crypto');

const DIGITAL_EYES_URL = "https://www.digit-eyes.com/gtin/v2_0/?language=en&app_key=/7mXxzaaaSMO&signature=";
const AUTH_KEY = 'Ab67K1y9g0Cp7Om9';

exports.scrape = function(barcodeId){
    return new Promise((resolve,reject) => {
        let product = new Product();
        let unfoundProduct = new UnfoundProduct();
        product.barcode_id = barcodeId;
        console.log(DIGITAL_EYES_URL + barcodeId);
        try {
            var url = DIGITAL_EYES_URL + createSigniture(AUTH_KEY, barcodeId) + '&upcCode=' + barcodeId;
            console.log(url);
        }catch (err){
            console.log(err);
        }
        request(url, (err, response,body) => {
            //check if this item exist in DB
            console.log(JSON.parse(body));
            var productFromServer = JSON.parse(body);
            //only in case we got positive response
            if(productFromServer.return_code === '000'){
                product.name =productFromServer.description;
                product.image_url =productFromServer.image;
                product.ingredients = productFromServer.ingredients.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);;
                product.product_url = productFromServer.product_web_page;
                product.scraper_strategy = 'digit-eye';
                product.scraped_time = new Date();
                product.scrape_result = 'FOUND';
            }else{
                unfoundProduct.barcode_id = product.barcode_id;
                unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_DIGIT_EYES_DB_ERROR_CODE';
                unfoundProduct.error = productFromServer.return_code + ' ' + productFromServer.return_message;
                reject(unfoundProduct);
            }
            // product.name = $('h5').text().trim();
            // product.image_url = $('table img').attr('src');
            // if($('#ingredients')) {
            //     product.ingredients = $('#ingredients').text().replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);
            // }else{
            //     We need to get it from another site
            // }

            if(product.name === '') {
                unfoundProduct.barcode_id = product.barcode_id;
                unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_DIGIT_EYES_DB';
                reject(unfoundProduct);
            }else{
                resolve(product);
            }
        });
    });
};

createSigniture = function(auth_key,upc_code){
    var hash = crypto.createHmac('sha1',auth_key);
    hash.update(upc_code);
    var sig = hash.digest('base64');
    console.log(sig);
    return sig;
    // return new Buffer(hash).toString('base64')
};