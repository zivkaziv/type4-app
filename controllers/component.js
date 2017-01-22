var Component = require('../models/Component');

/**
 * POST /component
 */
exports.componentPost = function(req, res) {
    if(req.body.components){
        console.log(req.body.components);
        Component.find({ names: req.body.components }, function(err, comp) {
            if (comp && comp.length > 0) {
                return res.status(400).send({ msg: 'This compoent already exist' });
            }
            comp = new Component({
                names:req.body.components
            });
            comp.save(function(err) {
                res.send({ components: comp });
            });
        });
    } else{
        return res.status(400).send({ msg: 'body is empty' });
    }
};



/**
 * GET /components
 */
exports.componentGet = function(req, res) {
    Component.find({}, function(err, comp) {
    res.send({ components: comp });
  });
};