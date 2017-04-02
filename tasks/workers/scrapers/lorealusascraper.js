/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const categories = ['hair-care','hair-color','makeup','hair-style','skin-care'];
const SCRAPER_STRATEGY = 'lorealparisusa';

const BASE_URL = 'http://www.lorealparisusa.com';
const CATEGORY_URL = 'http://www.lorealparisusa.com/products/{category}/shop-all-products.aspx?size=1000&page=1';

exports.LorealParisUsaScraper = class LorealParisUsaScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for( let categoryIndex = 0; categoryIndex < categories.length;  categoryIndex++){
            this.handleCategory(categories[categoryIndex]);
        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            productToScrape.ingredients = $('.tab-content-container .ingredients p').text().split('•').map((value)=>value.trim())
            productToScrape.image_url = SCRAPER_STRATEGY + $('.product-image-container img').attr('src');
            productToScrape.number_of_searches = 0;
            productToScrape.scraper_strategy = SCRAPER_STRATEGY;
            productToScrape.scraped_time = new Date();
            productToScrape.scrape_result = 'FOUND';

            // productToScrape.
            if(productToScrape.ingredients.length === 0){
                console.log('no ingredients for - ' + productToScrape.name);
                // productToScrape.remove();
            }else {
                console.log('save product - ' + productToScrape.name);
                productToScrape.save();
            }
        });
    }

    handleCategory(categoryName){
        let url = CATEGORY_URL.replace('{category}',categoryName);
        console.log('Scrape category - ' + url);
        cheerioReq(url, (err, $) => {
            var products = $('.subcat-product-box');
            for(let productIndex = 0; products.length; productIndex++) {
                let product = $(products[productIndex]);
                var productName = 'Loreal ' +  product.find('.data-brand').text().trim()  + ' ' +product.find('.data-product-name').text().trim();
                let scrapeProduct = new ScrapedProduct({
                    product_url: BASE_URL + product.find('a')[1].attribs.href,
                    scraper_strategy: SCRAPER_STRATEGY,
                    name: productName,
                    ingredients: [],
                    category: categoryName
                });

                scrapeProduct.save().then(function(res){
                    console.log(res);
                },function(err){
                    console.log(err);
                });
            }

        });
    }
};

