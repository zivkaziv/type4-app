/**
 * Created by ziv on 15/03/2017.
 */


const cheerioReq = require("cheerio-req");
const URL = 'https://www.whatsinproducts.com/types/index/1';

exports.whatsInProductScraper = class WhatsInProductScraper{
    constructor() {
    }

    scrapeProducts() {
        var products = [];
        cheerioReq(URL, (err, $) => {
            products = $('a');
        });
    }
};