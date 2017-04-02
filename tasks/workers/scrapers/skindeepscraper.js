
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");

const BRANDS_URL = 'https://www.ewg.org/skindeep/search.php?search_group=brands&showmore=brands&atatime=7750';
const PRODUCT_BASE_URL = 'https://www.ewg.org';
const BRAND_URL = 'https://www.ewg.org/skindeep/browse.php?brand_id=29&&showmore=products&atatime=150';
const SCRAPER_STRATEGY = 'ewg.skindeep.org';


exports.UnileverScraper = class UnileverScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        var brands = [];
        console.log(BRANDS_URL);
        const options = {
            url: BRANDS_URL,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
            }
        };
        request(options,(err, brandsResponse) => {
            brands = $('#table-browse tr');
            for(let brandIndex = 0 ; brandIndex < brands.length; brandIndex++){
                let numberOfProducts = $(brands[brandIndex]).find('#score_style_small').text().replace(' products','');
                if(numberOfProducts != '0') {
                    this.handleBrand(brands[brandIndex]);
                }
            }
        });
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            var ingredientsHtml = $('.wiop__product-page__ingredients-list--title');
            for( let ingredientIndex = 0 ; ingredientIndex < ingredientsHtml.length;ingredientIndex++ ){
                productToScrape.ingredients.push($($(ingredientsHtml)[ingredientIndex]).text().replace('Propellant','').trim().replace(/\s/g, " "))
            }
            productToScrape.number_of_searches = 0;
            productToScrape.scraped_time = new Date();
            productToScrape.scrape_result = 'FOUND';
            // productToScrape.
            if(productToScrape.ingredients.length === 0){
                console.log('delete product - ' + productToScrape.name);
                productToScrape.remove();
            }else {
                console.log('save product - ' + productToScrape.name);
                productToScrape.save();
            }
        });
    }

    handleBrand(brand){
        console.log(brand.value);
        var brandUrl = $(brand).find('a').first().attr('href');
        let productsUrl = BRAND_URL + brandUrl + 'products';
        const options = {
            url: productsUrl,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
            }
        };
        request(options,(err, productResponse) => {
            let productsUrl = PRODUCTS_URL + brand.value + '&page=' + page;
            const options = {
                url: productsUrl,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
                }
            };
            request(options,(err, productResponse) => {
                let products  = JSON.parse(productResponse.body).listing.items;
                for(let productIndex = 0; productIndex < products.length; productIndex++){
                    let scrapedProduct = new ScrapedProduct({
                        name : products[productIndex].title,
                        product_url : PRODUCT_BASE_URL + products[productIndex].url,
                        scraper_strategy:SCRAPER_STRATEGY,
                        ingredients : []
                    });

                    scrapedProduct.save().then(function(res){
                        console.log(res);
                    },function(err){
                        console.log(err);
                    });
                }
            });
        });
    }
};