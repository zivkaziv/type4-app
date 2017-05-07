//https://www.johnsonsbaby.com/baby-products?&&&page=1-4

var ScrapedProduct = require('../../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const SCRAPER_STRATEGY = 'johnsonsbaby.com';

const BASE_URL = 'https://www.johnsonsbaby.com';
const PRODUCTS_URL = 'https://www.johnsonsbaby.com/products?&&';
const PAGE_QUERY = '&page={pageNumber}';

exports.JohnsonBabyScraper = class JohnsonBabyScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for( let pageNumber = 0; pageNumber < 4;  pageNumber++){
            this.handlePage(pageNumber);
        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            productToScrape.ingredients = $("[aria-labeledby='tab_ingredients'] p").text().split(',').map(p=>p.trim());
            productToScrape.number_of_searches = 0;
            productToScrape.image_url =  $('.main-row img').attr('src');
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

    handlePage(pageNumber){
        let url = PRODUCTS_URL;
        if(pageNumber > 0){
            url += PAGE_QUERY.replace('{pageNumber}',pageNumber)
        }
        console.log('Url to scrape - ' + url);
        cheerioReq(url, (err, $) => {
            var products = $('.node--product .content .node__title a');
            for(let productIndex = 0; productIndex < products.length; productIndex++) {
                try {
                    let product = $(products[productIndex]);
                    var productName = product.text().trim();

                    let scrapeProduct = new ScrapedProduct({
                        product_url: BASE_URL + product.attr('href'),
                        scraper_strategy: SCRAPER_STRATEGY,
                        name: productName,
                        ingredients: []
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

