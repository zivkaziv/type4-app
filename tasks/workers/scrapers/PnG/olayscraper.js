/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const categories = ['facial-cleanser','moisturizer','skin-care-treatment','body-prod'];
const SCRAPER_STRATEGY = 'olay.com';

const BASE_URL = 'https://www.olay.com';
const CATEGORY_URL = 'https://www.olay.com/en-us/skin-care-products/';

exports.OlayScraper = class OlayScraper {
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
            productToScrape.ingredients = $('.pdp_ingredients .product_secondary_txt p').first().text().split(',').map((value)=>value.trim());
            productToScrape.number_of_searches = 0;
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
        let url = CATEGORY_URL + categoryName;
        console.log('Scrape category - ' + url);
        cheerioReq(url, (err, $) => {
            var products = $('#content-main li');
            for(let productIndex = 0; productIndex < products.length; productIndex++) {
                try {
                    let product = $(products[productIndex]);
                    var productName = product.find('.caption h2').text().trim();

                    let scrapeProduct = new ScrapedProduct({
                        product_url: BASE_URL + product.find('.caption h2 a').attr('href'),
                        image_url: product.find('.product-image img').attr('src'),
                        scraper_strategy: SCRAPER_STRATEGY,
                        name: productName,
                        ingredients: [],
                        category: categoryName
                    });

                    scrapeProduct.save().then(function (res) {
                        console.log(res);
                    }, function (err) {
                        console.log(err);
                    });
                }catch (err){
                    console.log(err);
                }
            }

        });
    }
};

