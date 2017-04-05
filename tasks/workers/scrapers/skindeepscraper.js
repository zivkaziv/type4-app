
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const cheerio = require('cheerio');

const BRANDS_URL = 'https://www.ewg.org/skindeep/search.php?search_group=brands&showmore=brands&atatime=7500';
const PRODUCT_BASE_URL = 'https://www.ewg.org';
const BRAND_URL = 'https://www.ewg.org/skindeep/browse.php?brand_id=';
const SCRAPER_STRATEGY = 'ewg.skindeep.org';

exports.SkinDeepScraper = class SkinDeepScraper {
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
        cheerioReq(options,(err, $) => {
            brands = $('#table-browse tr');
            // for(let brandIndex = 0 ; brandIndex < brands.length; brandIndex++){
            for(let brandIndex = 1 ; brandIndex <  brands.length; brandIndex++){
                let numberOfProducts = $(brands[brandIndex]).find('#score_style_small').text().replace(' products','');
                if(numberOfProducts != '0' && numberOfProducts != '') {
                    this.handleBrand(brands[brandIndex]);
                }
            }
        });
    }

    handleProduct(productToScrape){
        cheerioReq(productToScrape.product_url, (err, $) => {
            var ingredientsHtml = $('#Ingredients tr');
            for( let ingredientIndex = 1 ; ingredientIndex < ingredientsHtml.length;ingredientIndex++ ){
                productToScrape.ingredients.push($(ingredientsHtml[ingredientIndex]).find('a').first().text().trim());
            }
            productToScrape.image_url = $('.right2012product_left img').attr('src');
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
        try {
            console.log(brand.value);
            let $ = cheerio.load(brand);
            var brandUrl = $(brand).find('a').first().attr('href');
            let productsUrl = PRODUCT_BASE_URL + brandUrl + 'products/';
            const options = {
                url: productsUrl,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0' // optional headers
                }
            };

            cheerioReq(options, (err, $) => {
                let brand_id = $('input[name="brand_id"]').attr('value');
                //this one in order to get all the products of the brand;
                options.url = BRAND_URL + brand_id + '&&showmore=products&atatime=250';
                cheerioReq(options, (err, $) => {
                    let products = $('#table-browse tr');
                    for (let productIndex = 1; productIndex < products.length; productIndex++) {
                        let scrapedProduct = new ScrapedProduct({
                            name: $($(products[productIndex]).find('a')[1]).text(),
                            product_url: PRODUCT_BASE_URL + $($(products[productIndex]).find('a')[1]).attr('href'),
                            scraper_strategy: SCRAPER_STRATEGY,
                            ingredients: []
                        });

                        scrapedProduct.save().then(function (res) {
                            console.log(res);
                        }, function (err) {
                            console.log(err);
                        });
                    }
                });
            });
        }catch (err){
            console.log('Error with brand - ' + brand);
        }
    }
};