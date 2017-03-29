
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');
var Product = require('../../../models/Product');

const cheerioReq = require("cheerio-req");
const cheerio = require('cheerio');
const fs = require('fs');
var path = require('path');

const BRANDS_URL = 'http://smartlabel.org/products';
const PRODUCT_URL = 'https://smartlabel-api.labelinsight.com/api/v3/';
const SCRAPER_STRATEGY = 'smartlabel.org';


exports.SmartLabelScraper = class SmartLabelScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        var root = path.dirname(require.main.filename);
        var inputFile= root + '/assets/brands/smartlabel/all_products.html';
        fs.readFile(inputFile, function (err, data) {
            if (err) {
                throw err;
            }
            var $= cheerio.load(data);
            var products = $('.series-table tr');
            for(let productIndex = 1; productIndex < products.length; productIndex++){
                  let scrapedProduct = new ScrapedProduct({
                      name : $(products[productIndex].childNodes[5]).text(),
                      product_url : $(products[productIndex].childNodes[5].children[0]).attr('href'),
                      scraper_strategy:SCRAPER_STRATEGY,
                      ingredients : []
                  });

                  scrapedProduct.save().then(function(res){
                      console.log(res);
                  },function(err){
                      console.log(err);
                  });
            }
        });
    }

    handleProduct(productToScrape){
        var url = productToScrape.product_url;
        if(url.indexOf('#ingredients') == -1){
            url = productToScrape.product_url + '#ingredients';
        }
        console.log(url);
        cheerioReq(url, (err, $) => {
            //in case it's not angular
            if($.html().indexOf('ui-view') === -1) {
                var ingredientsHtml = $('.ingredients__list li');
                for (let ingredientIndex = 0; ingredientIndex < ingredientsHtml.length; ingredientIndex++) {
                    productToScrape.ingredients.push($($(ingredientsHtml)[ingredientIndex]).text().trim().replace(/\s/g, " "))
                }
                productToScrape.image_url = $('.top__image').attr('src');
                productToScrape.barcode_id = $('.top__text__upc').text().trim();
                productToScrape.scraped_time = new Date();
                productToScrape.number_of_searches = 0;
                productToScrape.scrape_result = 'FOUND';
                // productToScrape.
                if(productToScrape.ingredients.length === 0 && (!productToScrape.barcode_id || productToScrape.barcode_id == '')){
                    console.log('delete product - ' + productToScrape.name);
                    productToScrape.remove();
                }else {
                    if(productToScrape.barcode_id &&  productToScrape.barcode_id !== ''){
                        //Save it as product
                        console.log('save product - ' + productToScrape.name);

                    }else{
                        console.log('save as scraped product - ' + productToScrape.name);
                    }
                    productToScrape.save();
                }
            }else{//This page in angular - we have url for get this item
                let productId = productToScrape.product_url.split('/').pop();
                console.log(PRODUCT_URL + productId);
                request(PRODUCT_URL + productId,function(err,response){
                    var product = JSON.parse(response.body);
                    if(product){
                        productToScrape.ingredients = product.rawIngredients.split(",").map((item)=>item.trim());
                        productToScrape.barcode_id = product.upc;
                        productToScrape.image_url = product.marketingImage.high;
                        productToScrape.name = product.title;
                        productToScrape.scraped_time = new Date(product.dateCollected);
                        productToScrape.number_of_searches = 0;
                        productToScrape.scrape_result = 'FOUND';

                        // productToScrape.
                        if(productToScrape.ingredients.length === 0 && (!productToScrape.barcode_id || productToScrape.barcode_id == '')){
                            console.log('delete product - ' + productToScrape.name);
                            productToScrape.remove();
                        }else {
                            if(productToScrape.barcode_id &&  productToScrape.barcode_id !== ''){
                                //Save it as product
                                console.log('save product - ' + productToScrape.name);

                            }else{
                                console.log('save as scraped product - ' + productToScrape.name);
                            }
                            productToScrape.save();
                        }
                    }else{
                        console.log('no data for product');
                    }
                });
            }
        });
    }
};