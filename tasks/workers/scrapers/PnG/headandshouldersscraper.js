/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const SCRAPER_STRATEGY = 'headandshoulders.com';

const BASE_URL = 'http://www.headandshoulders.com/';
const PRODUCTS_URL = 'http://www.headandshoulders.com/layouts/abbs/handlers/desktop/groupedproduct.aspx?viewtype=gridview&facets=&category=shop-products&page=2&sortby=popularity-desc&isfriendlyurl=true&cwidth=4&pscroll=&productsdisplayed=undefined';

exports.HeadAndSouldersScraper = class HeadAndSouldersScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        cheerioReq(PRODUCTS_URL, (err, $) => {
           let products = $('li');
            for(let productIndex = 0; productIndex < products.length; productIndex++) {
                try {
                    let product = $(products[productIndex]);
                    var productName = product.find('.caption span').text().trim();

                    let scrapeProduct = new ScrapedProduct({
                        product_url: BASE_URL + product.find('.caption a').attr('href'),
                        image_url: product.find('.product-image img').attr('src'),
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

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            productToScrape.ingredients = $('#phdesktopbody_0_phdesktopproductsecondarycontentarea_0_phdesktopproductdetailscontentarea_0_rptDivs_pnlContentDisplayStyle_1 p').text().replace('Active Ingredient: ','').replace('Inactive Ingredients: ',',').replace('Ingredients: ',',').split(',').map((value)=>value.trim());
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
};

