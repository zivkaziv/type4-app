
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');
var Product = require('../../../models/Product');

const cheerioReq = require("cheerio-req");
const cheerio = require('cheerio');
const fs = require('fs');
var path = require('path');

const BRANDS_URL = 'http://smartlabel.org/products';
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
            var ingredientsHtml = $('.ingredients__list li');
            for( let ingredientIndex = 0 ; ingredientIndex < ingredientsHtml.length;ingredientIndex++ ){
                productToScrape.ingredients.push($($(ingredientsHtml)[ingredientIndex]).text().trim().replace(/\s/g, " "))
            }
            productToScrape.image_url = $('.top__image').attr('src');
            productToScrape.barcode_id = $('.top__text__upc').text().trim();
            productToScrape.number_of_searches = 0;
            productToScrape.scraped_time = new Date();
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
        });
    }
};