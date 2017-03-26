
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");

const BRANDS_URL = 'https://www.unilever.co.uk/brands/whats-in-our-products/brands-and-products.json';
const PRODCUTS_URL = 'https://www.unilever.co.uk/brands/whats-in-our-products/brands-and-products.json?brand=';
const PRODCUT_BASE_URL = 'https://www.unilever.co.uk';

exports.UniliverScraper = class UniliverScraper {
    constructor() {
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
            brands = JSON.parse(brandsResponse.body).listing.filters.brand;
            for(let brandIndex = 0 ; brandIndex < brands.length; brandIndex++){
                this.handleBrand(brands[brandIndex]);
            }
        });
    }

    scrapeProductsFromQueue(){
        return setInterval(function() {
            // ScrapedProduct.findOne({$and:[{"scrape_result" : { $exists : false }}, { "ingredients":  {$size: 0}}]}, function(err, productToScrape) {
            ScrapedProduct.findOne({$and:[{'scraper_strategy' : 'unilever.uk'},{ "ingredients":  {$size: 0}}]}, function(err, productToScrape) {
                if(productToScrape) {
                    console.log('start scrape - ' + productToScrape.name);
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
                }else{
                    console.log('no products');
                }
            });
        }, 10000);
    }

    handleBrand(brand){
        console.log(brand.value);
        let page = 0;
        let totalNumberOfPages = 0;
        let productsUrl = PRODCUTS_URL + brand.value + '&page=' + page;
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
            //calculate the number of pages
            let response = JSON.parse(productResponse.body).listing;
            totalNumberOfPages = Math.ceil(response.total / response.perPage);

            for(page = 0; page < totalNumberOfPages; page++){
                let productsUrl = PRODCUTS_URL + brand.value + '&page=' + page;
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
                            product_url : PRODCUT_BASE_URL + products[productIndex].url,
                            scraper_strategy:"unilever.uk",
                            ingredients : []
                        });

                        scrapedProduct.save().then(function(res){
                            console.log(res);
                        },function(err){
                            console.log(err);
                        });
                    }
                });
            }
        });
    }
};