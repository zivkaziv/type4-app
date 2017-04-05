/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const categories = ['facial-cleanser','moisturizer','skin-care-treatment','body-prod'];
const SCRAPER_STRATEGY = 'gillete.com';

const BASE_URL = 'https://www.gillette.com';
const PRODUCTS_URL_PRE_N_POST_SHAVE = 'http://gillette.com/en-us/products/pre-and-post-shave#viewtype:gridview/facets:/category:pre-and-post-shave/page:{page}/sortby:Featured Sort/productsdisplayed:undefined/cwidth:3/promotilesenabled:false/pcwidth:/cwidth:3/pscroll:';
const PRODUCTS_URL_DEORDORANTS = 'http://gillette.com/en-us/products/deodorants-and-body-washes#viewtype:gridview/facets:/category:deodorants-and-body-washes/page:{page}/sortby:Featured Sort/productsdisplayed:undefined/cwidth:3/promotilesenabled:false/pcwidth:/cwidth:3/pscroll:';

exports.GilleteScraper = class GilleteScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        for( let pageNumber = 1; pageNumber <= 2;  pageNumber++){
            this.handlePage(PRODUCTS_URL_PRE_N_POST_SHAVE,pageNumber);
        }
        for( let pageNumber = 1; pageNumber <= 2;  pageNumber++){
            this.handlePage(PRODUCTS_URL_DEORDORANTS,pageNumber);
        }
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            let htmlPart = $('#phdesktopbody_0_phdesktopproductsecondarycontentarea_0_phdesktopproductdetailscontentarea_0_rptDivs_pnlContentDisplayStyle_1 p');
            for(let partIndex = 0; partIndex < htmlPart.length; partIndex++){
                var partText = $(htmlPart[partIndex]);
                if(partText.text() === 'INGREDIENTS') {
                    productToScrape.ingredients = $(htmlPart[++partIndex]).text().split(',').map((value) => value.trim());
                    break;
                }if(partText.text() === 'ACTIVE INGREDIENTS'){
                    productToScrape.ingredients.concat($(htmlPart[++partIndex]).text().split(',').map((value) => value.trim()))
                }if(partText.text() === 'INACTIVE INGREDIENTS'){
                    productToScrape.ingredients.concat($(htmlPart[++partIndex]).text().split(',').map((value) => value.trim()))
                }
            }
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

    handlePage(urlToScrape, pageNumber){
        let url = urlToScrape.replace('{pageNumber}',pageNumber);
        console.log('Scrape category - ' + url);
        cheerioReq(url, (err, $) => {
            var products = $('#content-wrapper li');
            for(let productIndex = 0; productIndex < products.length; productIndex++) {
                try {
                    let product = $(products[productIndex]);
                    var productName = product.find('.caption h3 a').text().trim();

                    let scrapeProduct = new ScrapedProduct({
                        product_url: BASE_URL + product.find('.caption h3 a').attr('href'),
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

