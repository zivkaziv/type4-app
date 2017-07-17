/**
 * POST /buildallergies
 */

var allergiesBuilder = require('../business/logic/allergiescollectionbuilder');
var Allergy = require('../models/Allergy');
var Product = require('../models/Product');
var ScrapedProduct = require('../models/Scrapedprodcut');
var nodemailer = require('nodemailer');
var allergiesCache = [];

exports.buildAllergiesCollectionPost = function(req, res) {
    allergiesBuilder.buildAllergiesCollection();
    res.send('done');
};
/**
 * GET /allergies
 */
exports.getAllAllergiesGet = function(req, res) {
    Allergy.find({}, function(err, allergies) {
        allergiesCache = allergies;
        res.send(allergies);
    });
};

exports.analyzeAllergiesPost = function(req,res){
    var fullProducts = [];
    var promiseWaitList = [];
    var allergiesDetectedRaw = [];
    var sumDetection = [];
    var products = req.body.products;
    handleAllergies().then(()=>{
        products.map((product) =>{
            promiseWaitList.push(findProduct(product,fullProducts))
        });
        Promise.all(promiseWaitList).then(() => {
            fullProducts.map((product) =>{
                var foundAIngredients = getAllergyFromProduct(allergiesCache,product);
                if(foundAIngredients.length > 0) {
                    allergiesDetectedRaw.push(foundAIngredients);
                }
            });

            sumDetection = sumAnalysis(allergiesDetectedRaw);

            res.send(...sumDetection);
        }).catch((e) => {
            res.error(e);
        });

    });

};

exports.analyzeAllergiesOnAllDbPost = function(req,res){
    var allergiesDetectedRaw = [];
    var sumDetection = [];
    var limit = req.query.limit ?Number(req.query.limit) :100;
    var offset = req.query.offset ?Number(req.query.offset):0;

    handleAllergies().then(()=>{
        getAllProducts(limit,offset).then((products) =>{
            products.map((product) =>{
                var foundIngredients = getAllergyFromProduct(allergiesCache,product);
                if(foundIngredients.length > 0) {
                    allergiesDetectedRaw.push(foundIngredients);
                }
            });
            sumDetection = sumAnalysis(allergiesDetectedRaw);
            sendSummaryEmail(sumDetection);
        });
    });
    res.send('Will be send shortly');
};

function findProduct(product,fullProducts){
    return new Promise((resolve,reject) => {
        let DbName = ScrapedProduct;
        if (product.db && product.db.indexOf('scrape') === -1) {
            DbName = Product;
        }
        DbName.findById(product._id,function(err,product){
            if(err) reject(err);
            fullProducts.push(product);
            resolve(product);
        })
    });
}

function getAllergyFromProduct(allergies,product){
    var ingredient_analysis =[];
    if(allergies && product && product.ingredients){
        for (let ingredientIndex = 0; ingredientIndex < product.ingredients.length; ingredientIndex++) {
            let isSensitiveIngredient = false;
            for (let allergyIndex = 0; allergyIndex < allergies.length; allergyIndex++) {
                if (allergies[allergyIndex].compound.toLowerCase().indexOf(product.ingredients[ingredientIndex].toLowerCase()) > -1) {
                    ingredient_analysis.push({
                        analysis: 'PROBLEMATIC_CHEMICAL',
                        weight:0.4,
                        chemicalName: allergies[allergyIndex].compound,
                        products:[product]
                    });
                    isSensitiveIngredient = true
                }
            }
            // if(!isSensitiveIngredient){
            //     ingredient_analysis.push({
            //         name: product.ingredients[ingredientIndex],
            //         analysis: 'NOT_SENSITIVE'
            //     })
            // }
        }
    }
    return ingredient_analysis;
}

function handleAllergies(){
    return new Promise((resolve,reject) => {
        if (allergiesCache.length === 0) {
            Allergy.find({}, function (err, allergies) {
                allergiesCache = allergies;
                resolve(allergiesCache);
            });
        } else {
            resolve(allergiesCache);
        }
    });
}

function sumAnalysis(allergiesDetectedRaw){
    var analysis = new Set();
    allergiesDetectedRaw.map((allergy) => {
        if(!analysis[allergy]){
            analysis.add(allergy);
        }else{
            analysis[allergy].weight += allergy.weight;
            analysis[allergy].weight = analysis[allergy].weight > 1 ? 1 : analysis[allergy].weight;
            analysis[allergy].products.concat(allergy.products);
        }
    });
    return analysis;
}

function getAllProducts(limit,offset){
    return new Promise((resolve,reject) => {
        let DbName = ScrapedProduct;
        DbName.find().skip(offset).limit(limit).exec((err,products)=>{
            if(err) reject(err);
            resolve(products);
        });
        // DbName.find({}, function (err, products) {
        //     if (err) reject(err);
        //     resolve(products);
        // })
    });
}

function sendSummaryEmail(sumDetection){
    var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
        }
    });
    var mailOptions = {
        to: 'ziv@typeiv.com;boaz@typeiv.com',
        from: 'info@typeiv.com',
        subject: 'Allergy analysis on our DB',
        text: JSON.stringify(...sumDetection)
    };
    transporter.sendMail(mailOptions, function(err) {
        if(err) console.log(err);
        else console.log('email sent');
    });
}