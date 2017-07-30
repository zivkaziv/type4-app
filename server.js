var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');

// Load environment variables from .env file
dotenv.load();

// Models
var User = require('./models/User');

// Controllers
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');
var productController = require('./controllers/product');
var componentController = require('./controllers/component');
var allergiesController = require('./controllers/allergies');
var scrapingController = require('./controllers/scraping');

var app = express();

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('port', process.env.PORT || 8000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return false;
    }
  };

  if (req.isAuthenticated()) {
    var payload = req.isAuthenticated();
    User.findById(payload.sub, function(err, user) {
      req.user = user;
      next();
    });
  } else {
    next();
  }
});

app.post('/signup', userController.signupPost);
app.post('/login', userController.loginPost);
app.post('/tokenlogin', userController.tokenLoginPost);
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.put('/clear/history', userController.ensureAuthenticated, userController.clearHistory);
app.post('/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.post('/product/:pId',productController.productByIdPost);
app.post('/report/product',productController.reportProblematicProductPost);
app.post('/react/product',productController.reportReactionProductPost);
app.post('/add/product',productController.addProductManually);
app.post('/save/product',productController.saveProductManually);
app.get('/product/:pId',productController.productGet);
app.get('/product',productController.productByQueryGet);
app.get('/producttoadd',productController.productToAddGet);
app.post('/product',productController.productPost);
app.get('/component',componentController.componentGet);


app.post('/scrapewhatsinproduct',scrapingController.whatsInProductScrapePost);
app.post('/scrapeunilever',scrapingController.unileverScrapePost);
app.post('/smartlabel',scrapingController.smartLabelScrapePost);
app.post('/householddb',scrapingController.houseHoldDBScrapePost);
app.post('/skindeep',scrapingController.skinDeepScrapePost);
app.post('/lorealusa',scrapingController.lorealParisUsaScrapePost);
app.post('/png',scrapingController.pnGScrapePost);
app.post('/goodguide',scrapingController.goodGuideScrapePost);
app.post('/jnj',scrapingController.jnjScrapePost);

app.post('/scrapingstart',scrapingController.ScrapeProductsStartPost);
app.get('/scrapingmonitor',scrapingController.ScrapeProductsStartGet);
app.post('/scrapingstop',scrapingController.ScrapeProductsStopPost);



app.post('/buildallergies',allergiesController.buildAllergiesCollectionPost);
app.get('/allergies',allergiesController.getAllAllergiesGet);
app.post('/analyzeAllergies',allergiesController.analyzeAllergiesPost);
app.post('/analyzeDB',allergiesController.analyzeAllergiesOnAllDbPost);


//TBD
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
app.post('/contact', contactController.contactPost);


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
