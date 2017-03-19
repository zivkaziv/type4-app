/**
 * POST /component
 */

var scraperObject = require('../tasks/workers/scrapers/whatsinproductsscraper');

exports.whatsInProductScrapePost = function(req, res) {
    var scraper = new scraperObject.whatsInProductScraper();
    scraper.scrapeProducts();
    res.status(200).send({ msg: 'started' });
};
