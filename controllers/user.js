var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var qs = require('querystring');
var User = require('../models/User');
var Allergy = require('../models/Allergy');

function generateToken(user) {
  var payload = {
    iss: 'my.domain.com',
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(7, 'days').unix()
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET);
}

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};
  /**
   * POST /login
   * Sign in with email and password
   */
exports.loginPost = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
      return res.status(400).send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        return res.status(401).send({ msg: 'The email address ' + req.body.email + ' is not associated with any account. ' +
        'Double-check your email address and try again.'
        });
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({ msg: 'Invalid email or password' });
        }
        updateUserAllergies(user);
        user.loginDate = new Date();
        user.save();
        res.send({ token: generateToken(user), user: user.toJSON() });
      });
    });
  };

/**
 * POST /tokenlogin
 * Sign in with email and password
 */
exports.tokenLoginPost = function(req, res, next) {
    var errors = req.validationErrors();
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    var tokenParams = jwt.decode(token, process.env.TOKEN_SECRET);
    if(tokenParams){
        var userId = tokenParams.sub;
    }

    User.findById(userId , function(err, user) {
      if (!user) {
          return res.status(401).send('Unable to find user according to token')
      }else{
          updateUserAllergies(user);
          user.loginDate = new Date();
          user.save();
          res.send({ token: generateToken(user), user: user.toJSON() });
      }
    });
};

/**
 * POST /signup
 */
exports.signupPost = function(req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  User.findOne({ email: req.body.email }, function(err, user) {
    if (user) {
    return res.status(400).send({ msg: 'The email address you have entered is already associated with another account.' });
    }
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      dob: req.body.dob,
      gender: req.body.gender
    });
    user.save(function(err) {
        sendNewUserSignupEmail(user);
        sendWelcomeEmail(user);
        res.send({ token: generateToken(user), user: user });
    });
  });
};

/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {
  if ('password' in req.body) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
  } else {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
  }

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  User.findById(req.user.id, function(err, user) {
    if ('password' in req.body) {
      user.password = req.body.password;
    } else {
      user.email = req.body.email;
      user.name = req.body.name;
      user.gender = req.body.gender;
      user.location = req.body.location;
      user.website = req.body.website;
      user.allergies = req.body.allergies;
      user.searches = req.body.searches;
      user.ionic_id = req.body.ionic_id;
      user.push_token = req.body.push_token;
    }
    user.save(function(err) {
      if ('password' in req.body) {
        res.send({ msg: 'Your password has been changed.' });
      } else if (err && err.code === 11000) {
        res.status(409).send({ msg: 'The email address you have entered is already associated with another account.' });
      } else {
        res.send({ user: user, msg: 'Your profile information has been updated.' });
      }
    });
  });
};

/**
 * PUT /clear/history
 * Update profile information OR change password.
 */
exports.clearHistory = function(req, res, next) {
    if ('password' in req.body) {
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.assert('confirm', 'Passwords must match').equals(req.body.password);
    } else {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({ remove_dots: false });
    }

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    User.findById(req.user.id, function(err, user) {
       user.searches = [];
        user.save(function(err) {
            res.send({ user: user, msg: 'Your search history has been deleted.' });
        });
    });
};

/**
 * DELETE /account
 */
exports.accountDelete = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    res.send({ msg: 'Your account has been permanently deleted.' });
  });
};

/**
 * GET /unlink/:provider
 */
exports.unlink = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    switch (req.params.provider) {
      case 'facebook':
        user.facebook = undefined;
        break;
      case 'google':
        user.google = undefined;
        break;
      case 'twitter':
        user.twitter = undefined;
        break;
      case 'vk':
        user.vk = undefined;
        break;
      case 'github':
          user.github = undefined;
        break;      
      default:
        return res.status(400).send({ msg: 'Invalid OAuth Provider' });
    }
    user.save(function(err) {
      res.send({ msg: 'Your account has been unlinked.' });
    });
  });
};

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return res.status(400).send({ msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'support@yourdomain.com',
        subject: '✔ Reset your password on Mega Boilerplate',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.send({ msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
        done(err);
      });
    }
  ]);
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
      return res.status(400).send(errors);
  }

  async.waterfall([
    function(done) {
      User.findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            return res.status(400).send({ msg: 'Password reset token is invalid or has expired.' });
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save(function(err) {
            done(err, user);
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your Mega Boilerplate password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.send({ msg: 'Your password has been changed successfully.' });
      });
    }
  ]);
};

exports.fixUserFieldsPost = function(req,res){
  let email = req.body.email;
  User.findOne({email:req.body.email},function(err,user){
    if(err) return res.send(err);
    if(user){
        //remove duplicates from search;
        if(user.searches) {
            user.searches = user.searches.filter((thing, index, self) => self.findIndex(t => t.barcode_id === thing.barcode_id) === index);
        }
        user.save();
        res.send('DONE');
    }else{
        res.send('NO_USER');
    }
  })
};

function updateUserAllergies(user){
    Allergy.find({}, function(err, allergies) {
        if(err) return;
        if(allergies) {
            for (let userAllergyIndex = 0; userAllergyIndex <user.allergies.length; userAllergyIndex++){
                for(let allergyIndex = 0; allergyIndex <allergies.length; allergyIndex++){
                    if(user.allergies[userAllergyIndex].title.toLowerCase().indexOf(allergies[allergyIndex].compound.toLowerCase()) > -1){
                        user.allergies[userAllergyIndex].description = allergies[allergyIndex].toObject({getters: false});
                        user.allergies[userAllergyIndex].originalObject = allergies[allergyIndex].toObject({getters: false});
                        break;
                    }
                }
            }
        }
        User.update({_id: user.id}, {
            allergies: user.allergies
        }, function(err, affected, resp) {
            // console.log(resp);
        })
    });
}

function setToUserAllAllergies(user){
    Allergy.find({}, function(err, allergies) {
        if(err) return;
        if(allergies) {
            // for (let userAllergyIndex = 0; userAllergyIndex <user.allergies.length; userAllergyIndex++){
            //     for(let allergyIndex = 0; allergyIndex <allergies.length; allergyIndex++){
            //         if(user.allergies[userAllergyIndex].title.toLowerCase().indexOf(allergies[allergyIndex].compound.toLowerCase()) > -1){
            //             user.allergies[userAllergyIndex].description = allergies[allergyIndex].toObject({getters: false});
            //             user.allergies[userAllergyIndex].originalObject = allergies[allergyIndex].toObject({getters: false});
            //             break;
            //         }
            //     }
            // }
            user.allergies = [];

            for(let allergyIndex = 0; allergyIndex <allergies.length; allergyIndex++){
                user.allergies.push({
                    title : allergies[allergyIndex].compound,
                    description : allergies[allergyIndex].toObject({getters: false}),
                    originalObject : allergies[allergyIndex].toObject({getters: false}),
                    image: ''
                })
            }
        }
        User.update({_id: user.id}, {
            allergies: user.allergies
        }, function(err, affected, resp) {
            // console.log(resp);
        })
    });
}

function sendNewUserSignupEmail(user){
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
        subject: 'Yeah.. New user signup',
        text: JSON.stringify(user)
    };
    transporter.sendMail(mailOptions, function(err) {
        if(err) console.log(err);
        else console.log('email sent');
    });
}

function sendWelcomeEmail(user){
    var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
        }
    });
    let nameForTheEmail = user.name;
    try {
        nameForTheEmail = user.name.split(' ')[0];
        if(!nameForTheEmail || nameForTheEmail===''){
            nameForTheEmail = user.name
        }
    }catch (err){
        nameForTheEmail = user.name;
    }
    var mailOptions = {
        to: user.email,
        bcc:'ziv@typeiv.com;boaz@typeiv.com',
        from: 'mark@typeiv.com',
        subject: 'Welcome to TypeIV!',
        text: `
Hi ${nameForTheEmail},

Welcome to TypeIV!

Skin allergy is what we do, and it's very important to us to keep you safe.

To begin using the app, update your allergen list as received from your doctor, then scan products which you're interested in, and we'd tell you whether they are safe for you or not. 

Our database is one of the biggest available for products and ingredients, and it keeps growing every day.

Feel free to contact me, we'd love your feedback and shaping the product better for our users.

Regards,

Mark Roberts
Head of Customer Experience
http://www.typeiv.com/`
    };
    transporter.sendMail(mailOptions, function(err) {
        if(err) console.log(err);
        else console.log('email sent');
    });
}