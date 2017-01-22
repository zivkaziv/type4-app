var User = require('../models/User');

/**
 * GET user/:uId/product/:pId
 */
exports.productGet = function(req, res) {
    console.log('ziv');
    res.send({ msg: 'Your account has been unlinked.' });
//   User.findById(req.user.id, function(err, user) {
//     switch (req.params.provider) {
//       case 'facebook':
//         user.facebook = undefined;
//         break;
//       case 'google':
//         user.google = undefined;
//         break;
//       case 'twitter':
//         user.twitter = undefined;
//         break;
//       case 'vk':
//         user.vk = undefined;
//         break;
//       case 'github':
//           user.github = undefined;
//         break;      
//       default:
//         return res.status(400).send({ msg: 'Invalid OAuth Provider' });
//     }
//     user.save(function(err) {
//       res.send({ msg: 'Your account has been unlinked.' });
//     });
//   });
};