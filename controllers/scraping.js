/**
 * POST /component
 */

var scraperWhatsInProductsObject = require('../tasks/workers/scrapers/whatsinproductsscraper');
var scraperUnileverObject = require('../tasks/workers/scrapers/unileverproductsscraper');
var smartLabelObject = require('../tasks/workers/scrapers/smartlabelscraper');
var houseHoldDBObject = require('../tasks/workers/scrapers/householddbscraper');
var skinDeepObject = require('../tasks/workers/scrapers/skindeepscraper');
var lorealParisUsaObject = require('../tasks/workers/scrapers/lorealusascraper');
var PnGMainObject = require('../tasks/workers/scrapers/PnG/pngmainscraper');
var goodGuideObject = require('../tasks/workers/scrapers/goodguidescraper');
var JnJObject = require('../tasks/workers/scrapers/JnJ/jnjmainscraper');
var SkinSafeObject = require('../tasks/workers/scrapers/skinsafescraper');
var commonScraper = require('../tasks/workers/scrapers/commonscraper');

var commonFixer = require('../tasks/workers/fixers/scrapedproductsfixer');

var scrapeInterval;
var fixerInterval;

exports.whatsInProductScrapePost = function(req, res) {
    var scraper = new scraperWhatsInProductsObject.whatsInProductScraper();
    scraper.addProductsToQueue(req.param('letter'));
    res.status(200).send({ msg: 'started' });
};

exports.unileverScrapePost = function(req, res) {
    var scraper = new scraperUnileverObject.UnileverScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.smartLabelScrapePost = function(req, res) {
    var scraper = new smartLabelObject.SmartLabelScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.houseHoldDBScrapePost = function(req, res) {
    var scraper = new houseHoldDBObject.HouseHoldDBScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.skinDeepScrapePost = function(req, res) {
    var scraper = new skinDeepObject.SkinDeepScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.lorealParisUsaScrapePost = function(req, res) {
    var scraper = new lorealParisUsaObject.LorealParisUsaScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.pnGScrapePost = function(req, res) {
    var scraper = new PnGMainObject.PnGMainScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.goodGuideScrapePost = function(req, res) {
    var scraper = new goodGuideObject.GoodGuideScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.jnjScrapePost = function(req, res) {
    var scraper = new JnJObject.JnJMainScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.skinSafeScrapePost = function(req, res) {
    var scraper = new SkinSafeObject.SkinSafeScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

//Common
exports.ScrapeProductsStartPost = function(req, res) {
    if(!scrapeInterval){
        var scraper = new commonScraper.CommonScraper();
        scrapeInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.ScrapeProductsStartGet = function(req, res) {
    if(!scrapeInterval){
        var scraper = new commonScraper.CommonScraper();
        scrapeInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.ScrapeProductsStopPost = function(req, res) {
    if(scrapeInterval){
        clearInterval(scrapeInterval);
        res.status(200).send({ msg: 'stopped' });
    }else{
        res.status(200).send({ msg: 'already stop' });
    }
};

exports.DbFixStartPost = function(req, res) {
    if(!scrapeInterval){
        var fixer = new commonFixer.CommonFixer();
        fixerInterval = fixer.fixProductsInScrapedProductsDB();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.DbFixMonitorGet = function(req, res) {
    if(!scrapeInterval){
        var scraper = new commonScraper.CommonScraper();
        scrapeInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.DbFixStopPost = function(req, res) {
    if(fixerInterval){
        clearInterval(fixerInterval);
        res.status(200).send({ msg: 'stopped' });
    }else{
        res.status(200).send({ msg: 'already stop' });
    }
};

