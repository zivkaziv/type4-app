/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const cheerio = require('cheerio');
const request = require('request');
// const categories = ['household','skin-care','makeup','hair-care','baby-products','bath-body','health-care','personal-care'];
const categories = ['household'];
const SCRAPER_STRATEGY = 'skinsafeproducts.com';

const BASE_URL = 'https://www.skinsafeproducts.com';
const CATEGORY_URL = 'https://www.skinsafeproducts.com/{category}?utf8=%E2%9C%93&per_page=10000';

const cookie='production_auth_token=93b20ede7ad65aeb04a94c26b9457d7dfc5b69c5; _gat=1; _ga=GA1.2.286317096.1501491719; _gid=GA1.2.124631511.1501491719; _vwo_uuid_v2=0CD3873714C5D37B8B04DC41C8BE6FF7|9f39e036ab207ec3bac53e7968e88f27; _product-wise-ui_session=b1f0f8716537187e128467880ea1b315; __atuvc=23%7C31; __atuvs=5982d2cafb6bbc9b001';
exports.SkinSafeScraper = class SkinSafeScraper {
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
            productToScrape.ingredients = $('.ingredients a.col-md-6').map((i,value)=>$(value).text().trim());
            productToScrape.image_url=$('#productimages img')[0].attribs.src;
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
        let url = CATEGORY_URL.replace('{category}',categoryName);
        console.log('Scrape category - ' + url);
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0', // optional headers
                'Cookie':'_ga=GA1.2.96572974.1501749397; _gid=GA1.2.1907631579.1501749397; _vwo_uuid_v2=97DF1814E1CD252C6FB3060271E79FAF|c96ced3a3550bdd8be1ce5b569f62c29; _gat=1; _product-wise-ui_session=fad397a03b680f83a24859e6ca9d4cec; __atuvc=3%7C31; __atuvs=5982e8dd9849e7d9000'
            }
        };
        request(options, (error, response, html) => {
            let $ = cheerio.load(html);
            var products = $('.search-results-result');
            for(let productIndex = 0; productIndex < products.length; productIndex++) {
                try {
                    let product = $(products[productIndex]);
                    var productName = product.find('.search-results-productname').text().trim();

                    let scrapeProduct = new ScrapedProduct({
                        product_url: BASE_URL + product.find('a')[1].attribs.href,
                        scraper_strategy: SCRAPER_STRATEGY,
                        name: productName,
                        ingredients: [],
                        category: categoryName
                        // image_url: product.find('img')[0].attribs.src
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

