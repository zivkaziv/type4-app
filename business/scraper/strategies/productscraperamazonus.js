/**
 * Created by ziv on 05/02/2017.
 */
const cheerioReq = require("cheerio-req");
const cheerio = require('cheerio');
const request = require('request');
var Product = require('../../../models/Product');
var UnfoundProduct = require('../../../models/Unfoundproduct');

const BARCODE_FINDER_URL =  "http://www.upcitemdb.com/upc/";
const AMAZON_PRODUCT_URL =  "http://www.amazon.com/dp/";

exports.scrape = function(barcodeId){
    return new Promise((resolve,reject) => {
        let product = new Product();
        let unfoundProduct = new UnfoundProduct();
        product.barcode_id = barcodeId;
        console.log(BARCODE_FINDER_URL + barcodeId);
        //First we'll find the amazon if of this product
        cheerioReq(BARCODE_FINDER_URL + barcodeId, (err, $) => {
            let elements = $(".detail-list").text().split('\n');
            for(let detailIndex = 0; detailIndex< elements.length; detailIndex++){
                let element = elements[detailIndex];
                if(element) {
                    if (element.trim().indexOf("Amazon ASIN:") > -1) {
                        product.amazon_id = elements[detailIndex].trim().split(':')[1].trim();
                        break;
                    }
                }
            }

            if(product.amazon_id) {
                //Scan amazon in order to find the ingredients and the rest of the details
                console.log(AMAZON_PRODUCT_URL + product.amazon_id);
                req = request.defaults({
                    jar: true,                 // save cookies to jar
                    rejectUnauthorized: false,
                    followAllRedirects: true   // allow redirections
                });

                const options = {
                    url: AMAZON_PRODUCT_URL + product.amazon_id,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Charset': 'utf-8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
                    }
                };

                // request(AMAZON_PRODUCT_URL + product.amazon_id, function (error, response, html) {
                request(options, function (error, response, html) {
                    try {
                        let $ = cheerio.load(html);
                        if($('img').attr('src').indexOf('Captcha') > -1){
                            console.log('Captcha was requested for barcode ID - ' + barcodeId + ' - AmazonId - ' + product.amazon_id );
                        }
                        product.name = $('#productTitle').text().trim();
                        product.category = $('#nav-subnav').attr('data-category') ? $('#nav-subnav').attr('data-category').trim() : '';
                        product.image_url = $('#landingImage').attr('data-old-hires') ? $('#landingImage').attr('data-old-hires').trim() : '';
                        product.scrape_result = 'FOUND';
                        product.scraper_strategy = 'amazon-us';
                        product.scraped_time = new Date();
                        let timeOfIngredients = false;
                        $('#importantInformation .content').contents().each(function () {
                            if (timeOfIngredients) {
                                product.ingredients = $(this).text().replace(/^\s+|\s+$/g, "").split(/\s*,\s*/);
                                timeOfIngredients = false;
                            }
                            if ($(this).text() === "Ingredients") {
                                timeOfIngredients = true;
                            }

                        });
                        if(product.name !== '') {
                            if(product.ingredients.length == 0){
                                unfoundProduct.barcode_id = product.barcode_id;
                                unfoundProduct.amazon_id = product.amazon_id;
                                unfoundProduct.name = product.name;
                                unfoundProduct.scrape_result = 'NO_INGREDIENTS';
                                reject(unfoundProduct);
                            }
                            resolve(product);
                        }else{
                            unfoundProduct.barcode_id = product.barcode_id;
                            unfoundProduct.amazon_id = product.amazon_id;
                            unfoundProduct.scrape_result = 'NOT_FOUND_PRODUCT_IN_AMAZON';
                            reject(unfoundProduct);
                        }
                    }catch (err){
                        unfoundProduct.barcode_id = product.barcode_id;
                        unfoundProduct.scrape_result = 'NOT_FOUND_ERROR';
                        unfoundProduct.error = err;
                        reject(unfoundProduct);
                    }
                });
            }else{
                unfoundProduct.barcode_id = product.barcode_id;
                unfoundProduct.scrape_result = 'NOT_FOUND_AMAZON_ID';
                reject(unfoundProduct);
            }
        });
    });
};