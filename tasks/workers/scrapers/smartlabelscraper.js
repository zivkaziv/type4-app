
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');

const cheerioReq = require("cheerio-req");

const BRANDS_URL = 'http://smartlabel.org/products';
const SCRAPER_STRATEGY = 'smartlabel.org';


exports.SmartLabelScraper = class SmartLabelScraper {
    constructor() {
    }

    getScrapeStrategy(){
        return SCRAPER_STRATEGY;
    }

    addProductsToQueue() {
        console.log(BRANDS_URL);
        let payload = `------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="XID"

6a570e3c386c0c7a0891cd43aa0fd8bbc8fe2e38
------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="RET"

/products
------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="edit_submit"

edit_submit
------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="company"


------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="brand"


------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="keyword"


------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="edit_submit.x"

26
------WebKitFormBoundaryfGKEU4qUVjBoZ6IK
Content-Disposition: form-data; name="edit_submit.y"

5
------WebKitFormBoundaryfGKEU4qUVjBoZ6IK--`;
        const options = {
            url: BRANDS_URL,
            method: 'POST',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' // optional headers
            },
            body: payload,
            json:true
        };
        cheerioReq(options,(err, $) => {
          var products = $('.series-table tr');
          for(let productIndex = 1; productIndex < products.length; productIndex++){
              let scrapedProduct = new ScrapedProduct({
                  name : products[productIndex].title,
                  product_url : PRODUCT_BASE_URL + products[productIndex].url,
                  scraper_strategy:"smartlabel.org",
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
};