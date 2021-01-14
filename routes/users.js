var express = require('express');
var router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../JWT/GenerateToken');

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SignUp Router 
router.post('/signup', async function (req, res, next) {

  let isFound = false;
  await User.find({ email: req.body.email })
    .then(result => {
      if (result.length > 0) {
        isFound = true
      }
    }).catch(err => {
      res.status(500).json({ err: err.message })
    })

  if (!isFound) {
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);

    if (hashedPassword) {
      const newUser = new User({ email: req.body.email, password: hashedPassword });

      await newUser.save()
        .then(response => {
          if (response) {
            res.status(200).json({ message: 'User is saved....' })
          } else {
            res.status(404).json({ message: 'User is Invalid....' })
          }
        }).catch(err => {
          res.status(500).json({ err: err.message })
        })
    }
  }
  else {
    res.status(404).json({ message: 'This Email is used before.....' })
  }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SignIn Router
router.post('/signin', async function(req,res,next){
  let emailIsFound, tmpUser;
  await User.find({ email: req.body.email })
    .then(user => {
      if (user.length > 0) {
        emailIsFound = true;
        tmpUser = user[0];
      } else {
        emailIsFound = false;
        res.status(404).json({ message: 'Invalid email...' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: err.message })
    });

  if (emailIsFound){
    let passwordsIsEqual = await bcrypt.compareSync(req.body.password, tmpUser.password)
    if (passwordsIsEqual) {
      // Generate Token
      let Token = generateToken(tmpUser._id, tmpUser.email);

      res.status(200).json({
        message: 'SignIn is Done....',
        //Send Token 
        Token:Token,
        role: tmpUser.role
      });
    } else {
      res.status(404).json({ message: 'Invalid Password...' })
    }
  }
})

module.exports = router;
