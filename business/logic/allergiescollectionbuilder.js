/**
 * Created by ziv on 19/02/2017.
 */

const csv=require('csvtojson');
var path = require('path');
var Allergy = require('../../models/Allergy');


var allergiesBuilder = {
    allergies : [],
    buildFromCSV : function(jsonObj){
        var allergyObj = new Allergy();
        allergyObj.compound = jsonObj['Compound'];
        allergyObj.db_name = jsonObj['db_name'];
        allergyObj.db_updated_date = new Date(jsonObj['updated_to']);
        allergyObj.concentration = jsonObj['Conc'];
        allergyObj.measure = jsonObj['Measure'];
        allergyObj.art_number = jsonObj['Art#'];
        for(let index = 0; index < 80; index++){
            var compoundSyn = jsonObj['field' + index];
            if(compoundSyn) {
                allergyObj.compound_synonyms.push(compoundSyn);
            }
        }
        return allergyObj;
  }
};

exports.buildAllergiesCollection = function(){
    console.log('start to build allergies');
    //get csv file
    var root = path.dirname(require.main.filename);
    var inputFile= root + '/assets/allergies/AllergyTableV002.csv';
    //convert it to object
    csv({noheader:false,
        ignoreEmpty:true,
        trim:true})
        .fromFile(inputFile)
        .on('json',(jsonObj)=>{
            //run for loop and create the allergies objects
            allergiesBuilder.allergies.push(allergiesBuilder.buildFromCSV(jsonObj));
        })
        .on('done',(error)=>{
            if(error){
                console.log(error);
            }else {
                //delete old records in allergies table
                Allergy.remove({}, function(){
                    //save new
                    Allergy.collection.insert(allergiesBuilder.allergies, function(){
                        console.log('end');
                    });
                });
            }
        });

    //create temp collection - allergiestemp


    //change the previous name of the collection allergies -> allergiesprev

    //change the current collection name to allergies

    //delete allergiesprev
};

