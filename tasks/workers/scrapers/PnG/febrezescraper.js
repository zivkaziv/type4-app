/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const categories = ['facial-cleanser','moisturizer','skin-care-treatment','body-prod'];
const SCRAPER_STRATEGY = 'febreze.com';

const BASE_URL = 'https://www.febreze.com';
const PRODUCTS_URL = 'http://febreze.com/layouts/abbs/handlers/desktop/ungroupedproduct.aspx?page={pageNumber}&sortby=popularity-desc&category=products-by-type&cwidth=4&pcwidth=1&displayedcount=2000&isPromoAdded=true&promotilesenabled=false';

exports.FebrezeScraper = class FebrezeScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for( let pageNumber = 1; pageNumber <= 13;  pageNumber++){
            this.handlePage(pageNumber);
        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            productToScrape.ingredients = $('#phdesktopbody_0_phdesktopproductsecondarycontentarea_0_phdesktopproductdetailscontentarea_0_rptDivs_pnlContentDisplayStyle_1 .secondary_content_icon_desc').first().text().split(',').map((value)=>value.trim());
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

    handlePage(pageNumber){
        let url = PRODUCTS_URL.replace('{pageNumber}',pageNumber);
        console.log('Scrape category - ' + url);
        cheerioReq(url, (err, $) => {
            var products = $('li');
            for(let productIndex = 0; productIndex < products.length; productIndex++) {
                try {
                    let product = $(products[productIndex]);
                    var productName = product.find('.caption h2 a').text().trim();

                    let scrapeProduct = new ScrapedProduct({
                        product_url: BASE_URL + product.find('.caption h2 a').attr('href'),
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
};

