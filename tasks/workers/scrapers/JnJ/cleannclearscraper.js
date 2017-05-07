/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const SCRAPER_STRATEGY = 'cleanandclear.com';

const BASE_URL = 'https://www.cleanandclear.com';
const PRODUCTS_URL = 'https://www.cleanandclear.com/products?&&';
const PAGE_QUERY = '&page={pageNumber}';

exports.CleanAndClearScraper = class CleanAndClearScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for( let pageNumber = 0; pageNumber < 3;  pageNumber++){
            this.handlePage(pageNumber);
        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            let ingredients = [];
            let ingredientsHtml = $("[aria-labeledby='tab_ingredients'] p");
            for(let ingredientsIndex = 0; ingredientsIndex < ingredientsHtml.length; ingredientsIndex++){
                let ingredientsRow = $(ingredientsHtml[ingredientsIndex]);
                //Is not the title
                if(ingredientsRow.text().indexOf('Ingredients') > 0){
                    ingredients.push($(ingredientsHtml[++ingredientsIndex]).text());
                }
            }
            productToScrape.ingredients = ingredients;
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

