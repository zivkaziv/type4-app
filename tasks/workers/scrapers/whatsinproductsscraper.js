/**
 * Created by ziv on 15/03/2017.
 */

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");
const URL = 'https://www.whatsinproducts.com/types/index/TypeLanguage.search:search/TypeLanguage.filter:%LETTER%/TypeLanguage.lang_id:1';
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
exports.whatsInProductScraper = class WhatsInProductScraper {
    constructor() {
    }

    addProductsToQueue(letter) {
        var products = [];
        // for(let letterIndex = 0; letterIndex < letters.length; letterIndex++){
        //     let urlToCheck = URL.replace('%LETTER%',letters[letterIndex]);
        let urlToCheck = URL.replace('%LETTER%', letter);
        console.log(urlToCheck);
        cheerioReq(urlToCheck, (err, $) => {
            var results = $('.rslt_prd_hldr .brnd_srch_brnd_name a');
            for (let itemIndex = 0; itemIndex < results.length; itemIndex++) {
                let scrapeProduct = new ScrapedProduct({
                    product_url: "https://www.whatsinproducts.com" + results[itemIndex].attribs.href,
                    scraper_strategy:"whatsinproducts",
                    name:$(results[itemIndex]).text().replace(/(\s\s\s*)/g, ''),
                    ingredients : []
                });
                // scrapeProduct.product_url = "https://www.whatsinproducts.com" + results[itemIndex].attribs.href;
                // scrapeProduct.scraper_strategy = "whatsinproducts";
                // products.push(scrapeProduct);
                scrapeProduct.save().then(function(res){
                    // console.log(res);
                },function(err){
                    // console.log(err);
                });
            }
            console.log('finished');
        });
    }

    scrapeProductsFromQueue(){
        return setInterval(function() {
            // ScrapedProduct.findOne({$and:[{"scrape_result" : { $exists : false }}, { "ingredients":  {$size: 0}}]}, function(err, productToScrape) {
            ScrapedProduct.findOne({ "ingredients":  {$size: 0}}, function(err, productToScrape) {
                if(productToScrape) {
                    console.log('start scrape - ' + productToScrape.name);
                    cheerioReq(productToScrape.product_url, (err, $) => {
                        var ingredientsHtml = $('.rslt_prd_hldr .brnd_srch_chem_name');
                        if(ingredientsHtml.length === 0){
                            ingredientsHtml = $('.rslt_prd_hldr .eu_othr_feild1_name.eu_chemical_name a');
                        }
                        for( let ingredientIndex = 0 ; ingredientIndex < ingredientsHtml.length;ingredientIndex++ ){
                            productToScrape.ingredients.push($($(ingredientsHtml)[ingredientIndex]).text().trim())
                        }
                        productToScrape.image_url = $('.big_img_hldr img').attr('src');
                        productToScrape.number_of_searches = 0;
                        productToScrape.scraper_strategy = 'whatsInProductScraper';
                        productToScrape.scraped_time = new Date();
                        productToScrape.scrape_result = 'FOUND';
                        productToScrape.category = $($('.breadcrumbs')[1]).text().split('::')[0].trim();
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
};

