/**
 * POST /component
 */

var scraperObject = require('../tasks/workers/scrapers/whatsinproductsscraper');
var scrapeInterval;
exports.whatsInProductScrapePost = function(req, res) {
    var scraper = new scraperObject.whatsInProductScraper();
    scraper.addProductsToQueue(req.param('letter'));
    res.status(200).send({ msg: 'started' });
};

exports.whatsInProductScrapePostStart = function(req, res) {
    if(!scrapeInterval){
        var scraper = new scraperObject.whatsInProductScraper();
        scrapeInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.whatsInProductScrapePostStop = function(req, res) {
    if(scrapeInterval){
        clearInterval(scrapeInterval);
        res.status(200).send({ msg: 'stopped' });
    }else{
        res.status(200).send({ msg: 'already stop' });
    }
};
