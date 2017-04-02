
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');
var Product = require('../../../models/Product');
var url = require('url');

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
                      // console.log(res);
                  },function(err){
                      // console.log(err);
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
                if(productToScrape.product_url.indexOf('servlet.') !== -1){
                    this.extractProductFromHTML($,productToScrape);
                }
                else if(productToScrape.product_url.indexOf('index.cfm') === -1) {
                    this.extractProductFromHTML($, productToScrape);
                }else{
                    this.extractProductByCFM($,productToScrape);
                }
            }else{//This page in angular - we have url for get this item
                this.extractProductWithRestAPI(productToScrape);
            }
        });
    }

    extractProductByCFM($,productToScrape) {
        var urlParts = url.parse(productToScrape.product_url,true);
        urlParts.origin = urlParts.protocol + '//' + urlParts.host;
        productToScrape.barcode_id = $('.upc').text().trim();
        productToScrape.image_url = urlParts.origin + $('.product-sub-section img').attr('src').substring(1);

        let productId = urlParts.query.product;
        console.log(urlParts.origin + '/sections/ingredients.cfm?product=' + productId);
        cheerioReq(urlParts.origin + '/sections/ingredients.cfm?product=' + productId,  (err, $) => {
            let ingredients = $('ul li a .list-title');
            for( let ingredientIndex = 0; ingredientIndex < ingredients.length;  ingredientIndex++){
                productToScrape.ingredients.push($(ingredients[ingredientIndex]).text().trim());
            }
            productToScrape.scraped_time = new Date();
            productToScrape.number_of_searches = 0;
            productToScrape.scrape_result = 'FOUND';

            // productToScrape.
            if (productToScrape.ingredients.length === 0 && (!productToScrape.barcode_id || productToScrape.barcode_id == '')) {
                console.log('no ingredients for product - ' + productToScrape.name);
                // productToScrape.remove();
            } else {
                if (productToScrape.barcode_id && productToScrape.barcode_id !== '') {
                    //Save it as product
                    console.log('save as product - ' + productToScrape.name);

                } else {
                    console.log('save as scraped product - ' + productToScrape.name);
                }
                productToScrape.save();
            }
        });
    }

    extractProductByServlet($,productToScrape) {
        var ingredientsHtml = $('#ingredients-list a');

        for (let ingredientIndex = 0; ingredientIndex < ingredientsHtml.length; ingredientIndex++) {
            productToScrape.ingredients.push($($(ingredientsHtml)[ingredientIndex]).text().trim().replace(/\s/g, " "))
        }
        productToScrape.image_url = $('.product-image img').attr('src');
        if(!productToScrape.image_url){
            productToScrape.image_url = $('.product-image img').attr('src');
        }
        productToScrape.barcode_id = $('.top__text__upc').text().trim();
        if(!productToScrape.barcode_id ){
            productToScrape.barcode_id = $('.upc').text().trim();
        }
        productToScrape.scraped_time = new Date();
        productToScrape.number_of_searches = 0;
        productToScrape.scrape_result = 'FOUND';
        // productToScrape.
        if (productToScrape.ingredients.length === 0 && (!productToScrape.barcode_id || productToScrape.barcode_id == '')) {
            console.log('not ingredients for product - ' + productToScrape.name);
            // productToScrape.remove();
        } else {
            if (productToScrape.barcode_id && productToScrape.barcode_id !== '') {
                //Save it as product
                console.log('save product - ' + productToScrape.name);

            } else {
                console.log('save as scraped product - ' + productToScrape.name);
            }
            productToScrape.save();
        }
    }

    extractProductFromHTML($, productToScrape) {
        var ingredientsHtml = $('.ingredients__list li');
        if(ingredientsHtml.length == 0){
            ingredientsHtml = $('#ingredients .list-title');
        }
        if(ingredientsHtml.length == 0){
            ingredientsHtml = $('#ingredients a');
        }
        if(ingredientsHtml.length == 0){
            ingredientsHtml = $('.ingredientdetails a');
        }
        for (let ingredientIndex = 0; ingredientIndex < ingredientsHtml.length; ingredientIndex++) {
            productToScrape.ingredients.push($($(ingredientsHtml)[ingredientIndex]).text().trim().replace(/\s/g, " "))
        }
        productToScrape.image_url = $('.top__image').attr('src');
        if(!productToScrape.image_url){
            productToScrape.image_url = $('.product-image img').attr('src');
        }
        productToScrape.barcode_id = $('.top__text__upc').text().trim();
        if(!productToScrape.barcode_id ){
            productToScrape.barcode_id = $('.upc').text().trim();
        }
        productToScrape.scraped_time = new Date();
        productToScrape.number_of_searches = 0;
        productToScrape.scrape_result = 'FOUND';
        // productToScrape.
        if (productToScrape.ingredients.length === 0 && (!productToScrape.barcode_id || productToScrape.barcode_id == '')) {
            console.log('not ingredients for product - ' + productToScrape.name);
            // productToScrape.remove();
        } else {
            if (productToScrape.barcode_id && productToScrape.barcode_id !== '') {
                //Save it as product
                console.log('save product - ' + productToScrape.name);

            } else {
                console.log('save as scraped product - ' + productToScrape.name);
            }
            productToScrape.save();
        }
    }

    extractProductWithRestAPI(productToScrape) {
        let productId = productToScrape.product_url.split('/').pop();
        console.log(PRODUCT_URL + productId);
        request(PRODUCT_URL + productId, function (err, response) {
            var product = JSON.parse(response.body);
            if (product) {
                productToScrape.ingredients = product.rawIngredients.split(",").map((item) => item.trim());
                if(productToScrape.ingredients.length == 0){
                    try {
                        productToScrape.ingredients = product.ingredientSection.ingredients.split(",").map((item) => item.trim());
                        productToScrape.ingredients.push(product.ingredientSection.activeIngredients.split(",").map((item) => item.trim()));
                        productToScrape.ingredients.push(product.ingredientSection.ingredientClaims.split(",").map((item) => item.trim()));
                        productToScrape.ingredients.push(product.ingredientSection.ingredientSymbols.split(",").map((item) => item.trim()));
                    }catch(err){
                        console.log(err);
                    }
                }
                productToScrape.barcode_id = product.upc;
                productToScrape.image_url = product.marketingImage.high;
                productToScrape.name = product.title;
                productToScrape.scraped_time = new Date(product.dateCollected);
                productToScrape.number_of_searches = 0;
                productToScrape.scrape_result = 'FOUND';

                // productToScrape.
                if (productToScrape.ingredients.length === 0 && (!productToScrape.barcode_id || productToScrape.barcode_id == '')) {
                    console.log('delete product - ' + productToScrape.name);
                    // productToScrape.remove();
                } else {
                    if (productToScrape.barcode_id && productToScrape.barcode_id !== '') {
                        //Save it as product
                        console.log('save as scraped product - ' + productToScrape.name);
                    } else {
                        console.log('not ingredients for product - ' + productToScrape.name);
                    }
                    productToScrape.save();
                }
            } else {
                console.log('no data for product');
            }
        });
    }
};