
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");

const PRODUCTS_URL = 'https://www.goodguide.com/products/directory/{letter}?page={pageNumber}';
// const letters = ['0-9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const letters = ['0-9'];//for debug
const PRODUCT_BASE_URL = 'https://www.goodguide.com';
const SCRAPER_STRATEGY = 'goodguide.com';


exports.GoodGuideScraper = class GoodGuideScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for(let letterIndex = 0 ; letterIndex < letters.length; letterIndex++){
            this.handlePage(letters[letterIndex],1);
        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url + '#product-ingredients', (err, $) => {
            var ingredientsHtml = $(".product-details-ingredients li");
            for(let ingredientIndex =0 ; ingredientIndex < ingredientsHtml.length; ingredientIndex++){
                productToScrape.ingredients.push($(ingredientsHtml[ingredientIndex]).text().trim());
            }
            productToScrape.name = $('.row h1').text();
            productToScrape.image_url = $('.product-media img').attr('src');

            let metadataHtml = $('#product-about .list li');
            for(let metadataIndex = 0 ; metadataIndex < metadataHtml.length; metadataIndex++){
                let metadata = $(metadataHtml[metadataIndex]);
                //try to get amazon id
                if(metadata.children().first().text() === 'Amazon ASIN'){
                    productToScrape.amazon_id = metadata.children().last().text();
                }
                //try to get barcode
                if(metadata.children().first().text() === 'UPCs'){
                    productToScrape.barcode_id = metadata.find('ul li').map(function(){
                        return $(this).text();
                    }).get().join();
                }
            }

            productToScrape.category = $('.breadcrumbs li').map(function() {
                return $(this).text();
            }).get().join('/');
            productToScrape.category = productToScrape.category.trim().substring(2).replace('Categories//','');

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

    handlePage(letter,pageNumber){
        let url = PRODUCTS_URL.replace('{letter}',letter).replace('{pageNumber}',pageNumber);
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'Accept-Charset': 'utf-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
            }
        };
        console.log('URL: ' + url);
        cheerioReq(options,(err, $) => {
            //in case it's not the end, call recursively
            if($('.next').length == 0 || $('.next .last').length > 0){
               this.handleProducts($);
               console.log('URL: ' + url + ' last page ' + pageNumber);
               return;
            }else {
                this.handleProducts($);
                this.handlePage(letter,++pageNumber);
            }

        });
    }

    handleProducts($){
        let products = $('.directory-content li a');
        for(let productIndex = 0; productIndex < products.length; productIndex++){
            try {
                let scrapedProduct = new ScrapedProduct({
                    name: $(products[productIndex]).text(),
                    product_url: PRODUCT_BASE_URL + $(products[productIndex]).attr('href'),
                    scraper_strategy: SCRAPER_STRATEGY,
                    ingredients: []
                });

                scrapedProduct.save().then(function (res) {
                    // console.log(res);
                }, function (err) {
                    // console.log(err);
                });
            }catch (err){
                console.log(err);
            }
        }
    }
};