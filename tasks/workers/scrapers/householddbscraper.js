
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");

const PRODUCTS_URL = 'https://hpd.nlm.nih.gov/cgi-bin/household/list?tbl=TblBrands&alpha=';
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const PRODUCT_BASE_URL = 'https://hpd.nlm.nih.gov';
const SCRAPER_STRATEGY = 'hpd.nlm.nih.gov';


exports.HouseHoldDBScraper = class HouseHoldDBScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for(let letterIndex = 0 ; letterIndex < letters.length; letterIndex++){
            let url = PRODUCTS_URL + letters[letterIndex];
            const options = {
                url: url,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
                }
            };
            cheerioReq(options,(err, $) => {
                this.handleProducts($);
            });

        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            var ingredientsHtml = $("table[width='620']").last()[0].children;
            //we are starting from 3 because the first 3 are for the headers
            for( let ingredientIndex = 3 ; ingredientIndex < ingredientsHtml.length;ingredientIndex++ ){
                if(ingredientsHtml[ingredientIndex].children && ingredientsHtml[ingredientIndex].children.length > 0) {
                    let ingridient = $(ingredientsHtml[ingredientIndex].children[0]).text().trim();
                    if(ingridient != '(Complete (M)SDS for this product)') {
                        productToScrape.ingredients.push($(ingredientsHtml[ingredientIndex].children[0]).text().trim());
                    }
                }
            }
            productToScrape.number_of_searches = 0;
            productToScrape.scraped_time = new Date();
            productToScrape.scrape_result = 'FOUND';
            if(productToScrape.ingredients.length === 0){
                console.log('delete product - ' + productToScrape.name);
                // productToScrape.remove();
            }else {
                console.log('save product - ' + productToScrape.name);
                productToScrape.save();
            }
        });
    }

    handleProducts($){
       let products = $('li a');
       for(let productIndex = 0; productIndex < products.length; productIndex++){
           let scrapedProduct = new ScrapedProduct({
               name : $(products[productIndex]).text(),
               product_url : PRODUCT_BASE_URL + $(products[productIndex]).attr('href'),
               scraper_strategy:SCRAPER_STRATEGY,
               ingredients : []
           });

           scrapedProduct.save().then(function(res){
               console.log(res);
           },function(err){
               console.log(err);
           });
       }
    }
};